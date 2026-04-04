import { prisma } from '@/lib/prisma';

export interface CouponValidationResult {
  valid: boolean;
  couponId?: number;
  code?: string;
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value?: number;
  discountAmount?: number;
  message: string;
}

/**
 * Validates a coupon code and calculates the discount.
 * Pure validation — no side effects (doesn't record usage).
 */
export async function validateCoupon(
  code: string,
  subtotal: number,
  email: string
): Promise<CouponValidationResult> {
  const fail = (message: string): CouponValidationResult => ({ valid: false, message });

  if (!code || !code.trim()) {
    return fail('Please enter a coupon code.');
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) {
    return fail('Invalid coupon code.');
  }

  if (!coupon.isActive) {
    return fail('This coupon is no longer active.');
  }

  const now = new Date();
  if (now < coupon.startDate) {
    return fail('This coupon is not yet valid.');
  }
  if (now > coupon.endDate) {
    return fail('This coupon has expired.');
  }

  // Global usage limit
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return fail('This coupon has reached its maximum usage limit.');
  }

  // Per-email usage limit
  const emailUsageCount = await prisma.couponUsage.count({
    where: {
      couponId: coupon.id,
      email: email.toLowerCase(),
    },
  });

  if (emailUsageCount >= coupon.maxUsesPerEmail) {
    return fail('You have already used this coupon.');
  }

  // Minimum order value
  if (coupon.minOrderValue !== null && subtotal < coupon.minOrderValue) {
    return fail(`Minimum order of ₹${coupon.minOrderValue} required for this coupon.`);
  }

  // Calculate discount
  let discountAmount: number;
  if (coupon.type === 'PERCENTAGE') {
    discountAmount = Math.ceil(subtotal * (coupon.value / 100));
    // Apply max discount cap
    if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    // FIXED_AMOUNT
    discountAmount = Math.min(coupon.value, subtotal); // Can't discount more than subtotal
  }

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    message: coupon.type === 'PERCENTAGE'
      ? `${coupon.value}% off — you save ₹${discountAmount}!`
      : `₹${discountAmount} off applied!`,
  };
}
