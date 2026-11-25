/**
 * @jest-environment node
 *
 * Tests for the authoritative server-side order pricing (src/lib/order-pricing.ts).
 * Uses the real discount, shipping, inventory and coupon logic; only Prisma is mocked.
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: { findMany: jest.fn() },
    shippingZone: { findFirst: jest.fn() },
    coupon: { findUnique: jest.fn() },
    couponUsage: { count: jest.fn() },
    globalConfig: { findUnique: jest.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import {
  CONVENIENCE_FEE,
  TOTAL_MISMATCH_TOLERANCE,
  checkClientTotal,
  priceOrder,
} from '@/lib/order-pricing';

const mocked = prisma as unknown as {
  product: { findMany: jest.Mock };
  shippingZone: { findFirst: jest.Mock };
  coupon: { findUnique: jest.Mock };
  couponUsage: { count: jest.Mock };
  globalConfig: { findUnique: jest.Mock };
};

// 100 gm packs; quantity is bulk stock in grams
const OYSTER = {
  id: 1, title: 'Oyster Powder', price: 499, quantity: 50000, inStock: true,
  measurementValue: 100, measurementType: 'gm', discounts: [] as any[],
};
// 15% off 600 → ceil(510) = 510; 500 gm stock → 5 packs
const LIONS_MANE = {
  id: 2, title: "Lion's Mane", price: 600, quantity: 500, inStock: true,
  measurementValue: 100, measurementType: 'gm', discounts: [{ type: 'PERCENTAGE', value: 15 }],
};
// ₹100 fixed off 349.5 → ceil(249.5) = 250
const SHIITAKE = {
  id: 3, title: 'Shiitake', price: 349.5, quantity: 1000, inStock: true,
  measurementValue: 100, measurementType: 'gm', discounts: [{ type: 'FIXED_AMOUNT', value: 100 }],
};

const ZONE = { id: 3, name: 'Delhi NCR', baseFee: 30, estimatedDays: '3-5 days' };

function coupon(overrides: Record<string, unknown> = {}) {
  return {
    id: 7, code: 'SAVE10', type: 'PERCENTAGE', value: 10,
    minOrderValue: 1000, maxDiscount: null, maxUses: null, maxUsesPerEmail: 1, usedCount: 0,
    startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000),
    isActive: true,
    ...overrides,
  };
}

function useProducts(...products: any[]) {
  mocked.product.findMany.mockImplementation(({ where }: any) =>
    Promise.resolve(products.filter((p) => where.id.in.includes(p.id)))
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useProducts(OYSTER, LIONS_MANE, SHIITAKE);
  mocked.shippingZone.findFirst.mockResolvedValue(ZONE);
  mocked.globalConfig.findUnique.mockResolvedValue(null);
  mocked.couponUsage.count.mockResolvedValue(0);
});

describe('priceOrder — prices come from the database', () => {
  it('ignores browser unit prices and uses DB price with the active product discount', async () => {
    const result = await priceOrder({
      // Extra browser fields (price/discountedPrice) must have no effect
      items: [
        { productId: 1, quantity: 2, price: 1, discountedPrice: 1 } as any,
        { productId: 2, quantity: 1, price: 1 } as any,
        { productId: 3, quantity: 1, discountedPrice: 0.01 } as any,
      ],
      pincode: '110001',
    });

    expect(result.ok).toBe(true);
    if (result.ok === false) return;
    const { pricing } = result;

    expect(pricing.items.map((l) => [l.productId, l.unitPrice, l.lineTotal])).toEqual([
      [1, 499, 998],
      [2, 510, 510],
      [3, 250, 250],
    ]);
    expect(pricing.subtotal).toBe(1758);
    // Below ₹1999 → base ₹50 + zone ₹30
    expect(pricing.shippingFee).toBe(80);
    expect(pricing.convenienceFee).toBe(CONVENIENCE_FEE);
    expect(CONVENIENCE_FEE).toBe(12);
    expect(pricing.total).toBe(1758 + 80 + 12);
  });

  it('gives free shipping at or above ₹1999 of the SERVER subtotal', async () => {
    const result = await priceOrder({ items: [{ productId: 1, quantity: 4 }], pincode: '110001' });
    expect(result.ok).toBe(true);
    if (result.ok === false) return;
    expect(result.pricing.subtotal).toBe(1996);
    expect(result.pricing.shippingFee).toBe(80);

    const result2 = await priceOrder({ items: [{ productId: 1, quantity: 5 }], pincode: '110001' });
    if (result2.ok === false) throw new Error('expected ok');
    expect(result2.pricing.subtotal).toBe(2495);
    expect(result2.pricing.shippingFee).toBe(0);
    expect(result2.pricing.freeShipping).toBe(true);
    expect(result2.pricing.total).toBe(2495 + 12);
  });

  it('merges duplicate lines for the same product', async () => {
    const result = await priceOrder({
      items: [{ productId: 1, quantity: 1 }, { productId: 1, quantity: 2 }],
      pincode: '110001',
    });
    if (result.ok === false) throw new Error('expected ok');
    expect(result.pricing.items).toHaveLength(1);
    expect(result.pricing.items[0].quantity).toBe(3);
  });
});

describe('priceOrder — input validation', () => {
  it.each([
    ['zero', 0],
    ['negative', -1],
    ['fraction', 1.5],
    ['string', '2'],
    ['NaN', NaN],
    ['null', null],
    ['missing', undefined],
  ])('rejects a %s quantity with 400 before touching the DB', async (_label, quantity) => {
    const result = await priceOrder({ items: [{ productId: 1, quantity }], pincode: '110001' });
    expect(result).toMatchObject({ ok: false, status: 400, code: 'INVALID_ITEMS' });
    expect(mocked.product.findMany).not.toHaveBeenCalled();
  });

  it.each([[0], [-3], [1.2], ['1'], [null]])('rejects invalid product id %p', async (productId) => {
    const result = await priceOrder({ items: [{ productId, quantity: 1 }], pincode: '110001' });
    expect(result).toMatchObject({ ok: false, status: 400, code: 'INVALID_ITEMS' });
  });

  it('rejects an empty cart', async () => {
    expect(await priceOrder({ items: [], pincode: '110001' })).toMatchObject({ ok: false, status: 400 });
    expect(await priceOrder({ items: 'x', pincode: '110001' })).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects an unknown product', async () => {
    const result = await priceOrder({ items: [{ productId: 999, quantity: 1 }], pincode: '110001' });
    expect(result).toMatchObject({ ok: false, status: 409, code: 'STOCK' });
    if (result.ok === false) expect(result.stockErrors).toEqual(['Product not found: ID 999']);
  });

  it('rejects an out-of-stock product', async () => {
    useProducts({ ...OYSTER, inStock: false });
    const result = await priceOrder({ items: [{ productId: 1, quantity: 1 }], pincode: '110001' });
    expect(result).toMatchObject({ ok: false, status: 409, code: 'STOCK' });
    if (result.ok === false) expect(result.stockErrors).toEqual(['"Oyster Powder" is out of stock']);
  });

  it('caps quantity at available packs (also across merged duplicate lines)', async () => {
    // Lion's Mane: 500 gm / 100 gm = 5 packs
    const over = await priceOrder({ items: [{ productId: 2, quantity: 6 }], pincode: '110001' });
    expect(over).toMatchObject({ ok: false, status: 409, code: 'STOCK' });
    if (over.ok === false) expect(over.stockErrors).toEqual(['"Lion\'s Mane" only has 5 unit(s) available']);

    const split = await priceOrder({
      items: [{ productId: 2, quantity: 3 }, { productId: 2, quantity: 3 }],
      pincode: '110001',
    });
    expect(split).toMatchObject({ ok: false, status: 409, code: 'STOCK' });

    const exact = await priceOrder({ items: [{ productId: 2, quantity: 5 }], pincode: '110001' });
    expect(exact.ok).toBe(true);
  });

  it('rejects an invalid pincode', async () => {
    for (const pincode of ['', '12345', 'abcdef', 110001, undefined]) {
      const result = await priceOrder({ items: [{ productId: 1, quantity: 1 }], pincode });
      expect(result).toMatchObject({ ok: false, status: 400, code: 'INVALID_PINCODE' });
    }
  });

  it('rejects an undeliverable pincode', async () => {
    mocked.shippingZone.findFirst.mockResolvedValue(null);
    const result = await priceOrder({ items: [{ productId: 1, quantity: 1 }], pincode: '999999' });
    expect(result).toMatchObject({ ok: false, status: 400, code: 'UNDELIVERABLE' });
  });
});

describe('priceOrder — coupons use the server subtotal', () => {
  it('rejects a coupon when the SERVER subtotal is below the minimum order', async () => {
    mocked.coupon.findUnique.mockResolvedValue(coupon({ minOrderValue: 1000 }));
    // Server subtotal = 2 × 499 = 998 (a browser could claim anything; it is not an input)
    const result = await priceOrder({
      items: [{ productId: 1, quantity: 2 }],
      pincode: '110001',
      couponCode: 'SAVE10',
      email: 'a@example.com',
    });
    expect(result).toMatchObject({ ok: false, status: 400, code: 'COUPON' });
    if (result.ok === false) expect(result.error).toContain('Minimum order of ₹1000');
  });

  it('applies the coupon to the SERVER subtotal', async () => {
    mocked.coupon.findUnique.mockResolvedValue(coupon({ minOrderValue: 1000, value: 10 }));
    // 3 × 499 = 1497 → 10% = ceil(149.7) = 150
    const result = await priceOrder({
      items: [{ productId: 1, quantity: 3, price: 10000 } as any],
      pincode: '110001',
      couponCode: 'save10',
      email: 'a@example.com',
    });
    if (result.ok === false) throw new Error(result.error);
    expect(result.pricing.subtotal).toBe(1497);
    expect(result.pricing.couponDiscount).toBe(150);
    expect(result.pricing.couponId).toBe(7);
    expect(result.pricing.total).toBe(1497 + 80 + 12 - 150);
  });

  it('requires an email when a coupon is used', async () => {
    const result = await priceOrder({
      items: [{ productId: 1, quantity: 3 }],
      pincode: '110001',
      couponCode: 'SAVE10',
    });
    expect(result).toMatchObject({ ok: false, status: 400, code: 'COUPON' });
    expect(mocked.coupon.findUnique).not.toHaveBeenCalled();
  });
});

describe('checkClientTotal', () => {
  async function pricing() {
    const result = await priceOrder({ items: [{ productId: 1, quantity: 2 }], pincode: '110001' });
    if (result.ok === false) throw new Error(result.error);
    return result.pricing; // total = 998 + 80 + 12 = 1090
  }

  it('accepts a missing total or one within ₹0.50', async () => {
    const p = await pricing();
    expect(TOTAL_MISMATCH_TOLERANCE).toBe(0.5);
    expect(checkClientTotal(undefined, p)).toBeNull();
    expect(checkClientTotal(null, p)).toBeNull();
    expect(checkClientTotal(1090, p)).toBeNull();
    expect(checkClientTotal(1090.5, p)).toBeNull();
    expect(checkClientTotal(1089.5, p)).toBeNull();
  });

  it('returns 409 with the server breakdown when the total differs by more than ₹0.50', async () => {
    const p = await pricing();
    const mismatch = checkClientTotal(1060, p);
    expect(mismatch?.status).toBe(409);
    expect(mismatch?.body).toMatchObject({
      code: 'TOTAL_MISMATCH',
      clientTotal: 1060,
      pricing: { subtotal: 998, shippingFee: 80, convenienceFee: 12, couponDiscount: 0, total: 1090 },
    });
    expect(String(mismatch?.body.error)).toContain('₹1090.00');
    expect(checkClientTotal(1090.51, p)?.status).toBe(409);
  });

  it('returns 400 for a non-numeric total', async () => {
    const p = await pricing();
    expect(checkClientTotal('1090', p)?.status).toBe(400);
    expect(checkClientTotal(NaN, p)?.status).toBe(400);
  });
});

describe("fresh delivery decisions", () => {
  it.each(["248001","248142"])("allows fresh and dried packs at approved PIN %s", async pincode => {
    useProducts({...OYSTER,fulfillmentClass:"fresh"}, {...LIONS_MANE,fulfillmentClass:"national"});
    expect(await priceOrder({items:[{productId:1,quantity:1},{productId:2,quantity:1}],pincode})).toMatchObject({ok:true});
  });
  it("allows a pantry order outside Dehradun and rejects a mixed bag before payment",async()=>{
    useProducts({...OYSTER,fulfillmentClass:"fresh"}, {...LIONS_MANE,fulfillmentClass:"national"});
    expect(await priceOrder({items:[{productId:2,quantity:1}],pincode:"110001"})).toMatchObject({ok:true});
    expect(await priceOrder({items:[{productId:1,quantity:1},{productId:2,quantity:1}],pincode:"110001"})).toMatchObject({ok:false,code:"UNDELIVERABLE"});
  });
  it("honours an operator's updated PIN allowlist on checkout",async()=>{
    useProducts({...OYSTER,fulfillmentClass:"fresh"});mocked.globalConfig.findUnique.mockResolvedValue({value:"248142"});
    expect(await priceOrder({items:[{productId:1,quantity:1}],pincode:"248001"})).toMatchObject({ok:false,code:"UNDELIVERABLE"});
  });
});
