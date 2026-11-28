import { isFreshMushroom } from "@/components/Pantry/catalogue";
import { freshDeliveryPins } from "@/lib/shipping";
/**
 * Authoritative server-side order pricing.
 *
 * Every route that creates an order MUST price it with `priceOrder()` and
 * store the values it returns. Amounts sent by the browser (unit prices,
 * subtotal, fees, total) are never used to build the order; the browser total
 * is only compared against the server total (see `checkClientTotal()`).
 */
import { prisma } from '@/lib/prisma';
import { availablePacks, isPackQuantity, MAX_ORDER_PACKS } from '@/lib/inventory';
import { validateCoupon } from '@/lib/coupon';
import { activeDiscountsInclude, effectiveUnitPrice } from '@/lib/product-pricing';
import { calculateShippingFee, findShippingZone, isValidPincode } from '@/lib/shipping';

import { CONVENIENCE_FEE } from '@/lib/fees';

export { CONVENIENCE_FEE };

/** Largest allowed difference between the browser total and the server total. */
export const TOTAL_MISMATCH_TOLERANCE = 0.5;

const MAX_LINE_ITEMS = 100;

export interface OrderLineInput {
  productId: unknown;
  quantity: unknown;
}

export interface PriceOrderInput {
  items: unknown;
  /** Delivery pincode (6 digits). */
  pincode: unknown;
  couponCode?: unknown;
  /** Customer email. Required when a coupon code is given (per-email limits). */
  email?: unknown;
}

export interface PricedOrderLine {
  productId: number;
  title: string;
  quantity: number;
  /** Product list price before any product discount. */
  listPrice: number;
  /** Price per unit the shopper pays (product discount applied). */
  unitPrice: number;
  lineTotal: number;
}

export interface OrderPricing {
  items: PricedOrderLine[];
  subtotal: number;
  shippingFee: number;
  freeShipping: boolean;
  convenienceFee: number;
  couponDiscount: number;
  couponId: number | null;
  couponCode: string | null;
  total: number;
  pincode: string;
  shippingZone: { id: number; name: string; estimatedDays: string | null };
}

export type PricingErrorCode =
  | 'INVALID_ITEMS'
  | 'STOCK'
  | 'INVALID_PINCODE'
  | 'UNDELIVERABLE'
  | 'COUPON';

export interface PricingFailure {
  ok: false;
  status: 400 | 409;
  code: PricingErrorCode;
  error: string;
  stockErrors?: string[];
}

export type PriceOrderResult = { ok: true; pricing: OrderPricing } | PricingFailure;

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function fail(
  status: 400 | 409,
  code: PricingErrorCode,
  error: string,
  stockErrors?: string[]
): PricingFailure {
  return stockErrors ? { ok: false, status, code, error, stockErrors } : { ok: false, status, code, error };
}

/** Validate line items and merge duplicate products into one line. */
function normalizeLines(
  items: unknown
): { ok: true; lines: { productId: number; quantity: number }[] } | PricingFailure {
  if (!Array.isArray(items) || items.length === 0) {
    return fail(400, 'INVALID_ITEMS', 'Your cart is empty.');
  }
  if (items.length > MAX_LINE_ITEMS) {
    return fail(400, 'INVALID_ITEMS', `An order can have at most ${MAX_LINE_ITEMS} items.`);
  }

  const merged = new Map<number, number>();
  for (const raw of items as OrderLineInput[]) {
    const productId = raw?.productId;
    const quantity = raw?.quantity;

    if (!isPackQuantity(productId)) {
      return fail(400, 'INVALID_ITEMS', 'Invalid product in cart.');
    }
    if (!isPackQuantity(quantity)) {
      return fail(400, 'INVALID_ITEMS', 'Quantity must be a whole number of 1 or more.');
    }
    const combined = (merged.get(productId) ?? 0) + quantity;
    if (combined > MAX_ORDER_PACKS) return fail(400, 'INVALID_ITEMS', 'Quantity is too large for one product.');
    merged.set(productId, combined);
  }

  return {
    ok: true,
    lines: Array.from(merged.entries()).map(([productId, quantity]) => ({ productId, quantity })),
  };
}

/**
 * Price an order from product IDs and quantities only.
 *
 * - Unit price: product list price with the active product discount
 *   (same rule as GET /api/products).
 * - Stock: product must exist, be in stock, and have enough packs.
 * - Shipping: zone for the delivery pincode (same rule as GET /api/shipping/check),
 *   free at or above FREE_SHIPPING_THRESHOLD of the server subtotal.
 * - Convenience fee: CONVENIENCE_FEE.
 * - Coupon: validateCoupon() with the server subtotal.
 */
export async function priceOrder(input: PriceOrderInput): Promise<PriceOrderResult> {
  const normalized = normalizeLines(input.items);
  if (normalized.ok === false) return normalized;
  const { lines } = normalized;

  const pincode = typeof input.pincode === 'string' ? input.pincode.trim() : input.pincode;
  if (!isValidPincode(pincode)) {
    return fail(400, 'INVALID_PINCODE', 'Please enter a valid 6-digit delivery pincode.');
  }

  let couponCode: string | null = null;
  if (input.couponCode !== undefined && input.couponCode !== null && input.couponCode !== '') {
    if (typeof input.couponCode !== 'string') {
      return fail(400, 'COUPON', 'Coupon error: Invalid coupon code.');
    }
    if (typeof input.email !== 'string' || !input.email.trim()) {
      return fail(400, 'COUPON', 'Coupon error: An email address is required to use a coupon.');
    }
    couponCode = input.couponCode;
  }

  const products = await prisma.product.findMany({
    where: { archivedAt: null, id: { in: lines.map((l) => l.productId) } },
    select: {
      id: true,
      title: true,
      price: true,
      quantity: true,
      inStock: true,
      measurementValue: true,
      measurementType: true,
      fulfillmentClass: true,
      categories: { select: { category: { select: { slug: true } } } },
      discounts: activeDiscountsInclude(),
    },
  });

  const stockErrors: string[] = [];
  const pricedLines: PricedOrderLine[] = [];

  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) {
      stockErrors.push(`Product not found: ID ${line.productId}`);
      continue;
    }
    const packs = availablePacks(product.quantity, product.measurementValue, product.measurementType);
    if (!product.inStock || packs <= 0) {
      stockErrors.push(`"${product.title}" is out of stock`);
      continue;
    }
    if (line.quantity > packs) {
      stockErrors.push(`"${product.title}" only has ${packs} unit(s) available`);
      continue;
    }

    const unitPrice = effectiveUnitPrice(product.price, product.discounts);
    pricedLines.push({
      productId: product.id,
      title: product.title,
      quantity: line.quantity,
      listPrice: product.price,
      unitPrice,
      lineTotal: roundMoney(unitPrice * line.quantity),
    });
  }

  if (stockErrors.length > 0) {
    return fail(409, 'STOCK', 'Some items are unavailable', stockErrors);
  }

  const subtotal = roundMoney(pricedLines.reduce((sum, l) => sum + l.lineTotal, 0));

  const zone = await findShippingZone(pincode);
  if (!zone) {
    return fail(400, 'UNDELIVERABLE', `Sorry, we do not deliver to pincode ${pincode} yet.`);
  }
  if (products.some(isFreshMushroom) && !(await freshDeliveryPins()).includes(pincode)) {
    return fail(400, 'UNDELIVERABLE', 'Fresh mushrooms deliver only to approved Dehradun PINs. Remove fresh items to ship your pantry goods across India.');
  }
  const { shippingFee, freeShipping } = calculateShippingFee(zone.baseFee, subtotal);

  let couponDiscount = 0;
  let couponId: number | null = null;
  if (couponCode) {
    const couponResult = await validateCoupon(couponCode, subtotal, (input.email as string).trim());
    if (!couponResult.valid) {
      return fail(400, 'COUPON', `Coupon error: ${couponResult.message}`);
    }
    couponDiscount = roundMoney(couponResult.discountAmount ?? 0);
    couponId = couponResult.couponId ?? null;
    couponCode = couponResult.code ?? couponCode;
  }

  const total = roundMoney(subtotal + shippingFee + CONVENIENCE_FEE - couponDiscount);

  return {
    ok: true,
    pricing: {
      items: pricedLines,
      subtotal,
      shippingFee,
      freeShipping,
      convenienceFee: CONVENIENCE_FEE,
      couponDiscount,
      couponId,
      couponCode: couponId ? couponCode : null,
      total,
      pincode,
      shippingZone: { id: zone.id, name: zone.name, estimatedDays: zone.estimatedDays ?? null },
    },
  };
}

/** Breakdown that is safe to return to the browser. */
export function pricingBreakdown(pricing: OrderPricing) {
  return {
    items: pricing.items.map((l) => ({
      productId: l.productId,
      title: l.title,
      quantity: l.quantity,
      listPrice: l.listPrice,
      unitPrice: l.unitPrice,
      lineTotal: l.lineTotal,
    })),
    subtotal: pricing.subtotal,
    shippingFee: pricing.shippingFee,
    freeShipping: pricing.freeShipping,
    convenienceFee: pricing.convenienceFee,
    couponCode: pricing.couponCode,
    couponDiscount: pricing.couponDiscount,
    total: pricing.total,
  };
}

/** JSON body for a pricing failure (keeps the existing `stockErrors` shape). */
export function pricingErrorBody(failure: PricingFailure) {
  return failure.stockErrors
    ? { error: failure.error, code: failure.code, stockErrors: failure.stockErrors }
    : { error: failure.error, code: failure.code };
}

/**
 * Compare the total the browser showed the shopper with the server total.
 * Returns null when no total was sent or it matches within
 * TOTAL_MISMATCH_TOLERANCE; otherwise the response to send.
 */
export function checkClientTotal(
  clientTotal: unknown,
  pricing: OrderPricing
): { status: 400 | 409; body: Record<string, unknown> } | null {
  if (clientTotal === undefined || clientTotal === null) return null;

  if (typeof clientTotal !== 'number' || !Number.isFinite(clientTotal)) {
    return { status: 400, body: { error: 'Invalid order total.', code: 'INVALID_TOTAL' } };
  }

  if (Math.abs(clientTotal - pricing.total) > TOTAL_MISMATCH_TOLERANCE) {
    return {
      status: 409,
      body: {
        error:
          `Prices changed while you were checking out. The new total is ₹${pricing.total.toFixed(2)} ` +
          `(checkout showed ₹${clientTotal.toFixed(2)}). Confirm the new total to place the order.`,
        code: 'TOTAL_MISMATCH',
        clientTotal,
        pricing: pricingBreakdown(pricing),
      },
    };
  }

  return null;
}
