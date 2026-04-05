/**
 * Tests for coupon validation logic.
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    coupon: { findUnique: jest.fn() },
    couponUsage: { count: jest.fn() },
  },
}));

import { validateCoupon } from '../coupon';
import { prisma } from '@/lib/prisma';

const baseCoupon = {
  id: 1,
  code: 'SAVE20',
  type: 'PERCENTAGE' as const,
  value: 20,
  minOrderValue: 500,
  maxDiscount: 200,
  maxUses: 100,
  maxUsesPerEmail: 1,
  usedCount: 5,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2027-12-31'),
  isActive: true,
};

describe('validateCoupon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.couponUsage.count as jest.Mock).mockResolvedValue(0);
  });

  it('returns invalid for empty code', async () => {
    const result = await validateCoupon('', 1000, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('enter a coupon code');
  });

  it('returns invalid for non-existent code', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await validateCoupon('FAKE', 1000, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Invalid coupon code.');
  });

  it('returns invalid for inactive coupon', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({ ...baseCoupon, isActive: false });
    const result = await validateCoupon('SAVE20', 1000, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('no longer active');
  });

  it('returns invalid for expired coupon', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      ...baseCoupon,
      endDate: new Date('2020-01-01'),
    });
    const result = await validateCoupon('SAVE20', 1000, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('expired');
  });

  it('returns invalid for not-yet-started coupon', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      ...baseCoupon,
      startDate: new Date('2099-01-01'),
    });
    const result = await validateCoupon('SAVE20', 1000, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('not yet valid');
  });

  it('returns invalid when global usage limit reached', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      ...baseCoupon,
      maxUses: 5,
      usedCount: 5,
    });
    const result = await validateCoupon('SAVE20', 1000, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('maximum usage limit');
  });

  it('returns invalid when email already used the coupon', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(baseCoupon);
    (prisma.couponUsage.count as jest.Mock).mockResolvedValue(1);
    const result = await validateCoupon('SAVE20', 1000, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('already used');
  });

  it('returns invalid when order below minimum', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(baseCoupon);
    const result = await validateCoupon('SAVE20', 200, 'test@test.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Minimum order');
  });

  it('calculates percentage discount correctly', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(baseCoupon);
    const result = await validateCoupon('SAVE20', 1000, 'test@test.com');
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200); // 20% of 1000 = 200, capped at maxDiscount 200
  });

  it('caps percentage discount at maxDiscount', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(baseCoupon);
    const result = await validateCoupon('SAVE20', 5000, 'test@test.com');
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200); // 20% of 5000 = 1000, but capped at 200
  });

  it('calculates fixed amount discount correctly', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      ...baseCoupon,
      type: 'FIXED_AMOUNT',
      value: 150,
      maxDiscount: null,
      minOrderValue: null,
    });
    const result = await validateCoupon('SAVE20', 1000, 'test@test.com');
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(150);
  });

  it('fixed amount cannot exceed subtotal', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      ...baseCoupon,
      type: 'FIXED_AMOUNT',
      value: 500,
      maxDiscount: null,
      minOrderValue: null,
    });
    const result = await validateCoupon('SAVE20', 200, 'test@test.com');
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200); // capped at subtotal
  });

  it('normalizes code to uppercase', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(baseCoupon);
    await validateCoupon('save20', 1000, 'test@test.com');
    expect(prisma.coupon.findUnique).toHaveBeenCalledWith({ where: { code: 'SAVE20' } });
  });

  it('normalizes email to lowercase for usage check', async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(baseCoupon);
    await validateCoupon('SAVE20', 1000, 'Test@Test.com');
    expect(prisma.couponUsage.count).toHaveBeenCalledWith({
      where: { couponId: 1, email: 'test@test.com' },
    });
  });
});
