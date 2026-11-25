import {
  activeDiscountWhere,
  computeProductDiscount,
  effectiveUnitPrice,
  isUsableDiscount,
} from '@/lib/product-pricing';

describe('product discount rules shared by the storefront and order pricing', () => {
  it('applies only discounts that have started and not ended', () => {
    const now = new Date('2026-11-24T10:00:00Z');
    expect(activeDiscountWhere(now)).toEqual({
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    });
  });

  it('rounds a percentage discount up to the next rupee', () => {
    expect(computeProductDiscount(149, [{ type: 'PERCENTAGE', value: 10 }])).toEqual({
      discountedPrice: 135,
      discountPercentage: 10,
    });
    expect(effectiveUnitPrice(149, [{ type: 'PERCENTAGE', value: 10 }])).toBe(135);
  });

  it('ignores a discount that would make the product free, so the card and the order both use list price', () => {
    for (const discount of [
      { type: 'PERCENTAGE', value: 100 },
      { type: 'FIXED_AMOUNT', value: 149 },
      { type: 'FIXED_AMOUNT', value: 500 },
    ]) {
      expect(isUsableDiscount(149, discount)).toBe(false);
      expect(computeProductDiscount(149, [discount])).toEqual({ discountedPrice: null, discountPercentage: 0 });
      expect(effectiveUnitPrice(149, [discount])).toBe(149);
    }
  });

  it('ignores a discount that leaves the price unchanged', () => {
    expect(computeProductDiscount(149, [{ type: 'PERCENTAGE', value: 0.1 }]).discountedPrice).toBeNull();
  });

  it('keeps a fixed discount that leaves at least ₹1', () => {
    expect(computeProductDiscount(149, [{ type: 'FIXED_AMOUNT', value: 148 }]).discountedPrice).toBe(1);
  });

  it('uses list price when no discount applies', () => {
    expect(effectiveUnitPrice(449, [])).toBe(449);
    expect(effectiveUnitPrice(449, null)).toBe(449);
  });
});
