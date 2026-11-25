import { FRESH_DELIVERY_PINS } from "@/components/Pantry/delivery";
import { prisma } from '@/lib/prisma';

/** ₹50 minimum on every order (added on top of the zone fee). */
export const BASE_SHIPPING_FEE = 50;
/** Free shipping only when the subtotal is at or above ₹1999. */
export const FREE_SHIPPING_THRESHOLD = 1999;

export function isValidPincode(pincode: unknown): pincode is string {
  return typeof pincode === 'string' && /^\d{6}$/.test(pincode);
}

/** Matching active shipping zone for a pincode (highest priority first), or null. */
export async function findShippingZone(pincode: string) {
  return prisma.shippingZone.findFirst({
    where: {
      isActive: true,
      pincodeFrom: { lte: pincode },
      pincodeTo: { gte: pincode },
    },
    orderBy: [{ priority: 'desc' }, { id: 'asc' }],
  });
}

/**
 * Shipping fee for a zone. `zoneFee` is the zone's `baseFee` column, which is
 * the extra charge on top of BASE_SHIPPING_FEE.
 */
export function calculateShippingFee(
  zoneFee: number,
  subtotal: number
): { shippingFee: number; freeShipping: boolean } {
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  return {
    shippingFee: freeShipping ? 0 : BASE_SHIPPING_FEE + zoneFee,
    freeShipping,
  };
}

export async function freshDeliveryPins() {
  const saved = await prisma.globalConfig.findUnique({ where: { key: "fresh_delivery_pins" }, select: { value: true } });
  return saved ? saved.value.split(",").filter(Boolean) : [...FRESH_DELIVERY_PINS];
}
