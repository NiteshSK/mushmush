/**
 * Product discount rules shared by the storefront product APIs and the
 * server-side order pricing (src/lib/order-pricing.ts).
 *
 * Keep this the single source of truth: the price a shopper sees in the
 * product listing must be the price the order is created with.
 */

export interface DiscountLike {
  type: string; // DiscountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number;
}

/**
 * Prisma `where` for product discounts that apply right now: active, already
 * started, and not yet ended. A discount scheduled for later does not apply.
 */
export function activeDiscountWhere(now: Date = new Date()) {
  return {
    isActive: true,
    startDate: { lte: now },
    OR: [{ endDate: null }, { endDate: { gte: now } }],
  };
}

/**
 * Prisma `include.discounts` fragment. The admin API allows only one active
 * discount per product; the stable order makes `discounts[0]` deterministic
 * if more than one ever exists.
 */
export function activeDiscountsInclude(now: Date = new Date()) {
  return {
    where: activeDiscountWhere(now),
    orderBy: { id: 'asc' as const },
  };
}

/** Price after one discount, rounded up to the next rupee (not clamped). */
function applyDiscount(price: number, discount: DiscountLike): number | null {
  if (discount.type === 'PERCENTAGE') return Math.ceil(price * (1 - discount.value / 100));
  if (discount.type === 'FIXED_AMOUNT') return Math.ceil(price - discount.value);
  return null;
}

/**
 * True when the discount leaves a price above ₹0. A discount that would make
 * the product free (or negative) is treated as a data error and ignored
 * everywhere, so the storefront, the bag and the order all show list price.
 */
export function isUsableDiscount(price: number, discount: DiscountLike): boolean {
  const discounted = applyDiscount(price, discount);
  return discounted !== null && discounted > 0 && discounted < price;
}

/**
 * Discounted price from the first active discount record.
 * `discountedPrice` is null when no usable active discount exists.
 */
export function computeProductDiscount(
  price: number,
  discounts?: DiscountLike[] | null
): { discountedPrice: number | null; discountPercentage: number } {
  const activeDiscount = discounts?.[0];
  if (!activeDiscount || !(price > 0) || !isUsableDiscount(price, activeDiscount)) {
    return { discountedPrice: null, discountPercentage: 0 };
  }

  const discountedPrice = applyDiscount(price, activeDiscount) as number;
  const discountPercentage =
    activeDiscount.type === 'PERCENTAGE' ? activeDiscount.value : ((price - discountedPrice) / price) * 100;
  return { discountedPrice, discountPercentage };
}

/**
 * Unit price the shopper pays: the discounted price when a usable discount
 * applies, otherwise the list price. `computeProductDiscount` never returns
 * ₹0, so this matches the storefront rule `discountedPrice || price`.
 */
export function effectiveUnitPrice(price: number, discounts?: DiscountLike[] | null): number {
  return computeProductDiscount(price, discounts).discountedPrice ?? price;
}
