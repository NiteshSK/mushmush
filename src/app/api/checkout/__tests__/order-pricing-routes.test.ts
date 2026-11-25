/**
 * @jest-environment node
 *
 * Both order-creating routes must price orders with the shared server-side
 * priceOrder() and store server values, never browser amounts:
 * - POST /api/checkout/verify-and-place-order (guest / OTP checkout)
 * - POST /api/orders (signed-in)
 */

// verify-and-place-order signs a payment token with this secret.
process.env.NEXTAUTH_SECRET = 'test-secret';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: { findMany: jest.fn() },
    shippingZone: { findFirst: jest.fn() },
    coupon: { findUnique: jest.fn(), update: jest.fn() },
    couponUsage: { count: jest.fn(), create: jest.fn() },
    user: { findFirst: jest.fn(), create: jest.fn() },
    addresses: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    order: { create: jest.fn() },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

jest.mock('@/lib/otp-store', () => ({
  otpStore: { verify: jest.fn(), check: jest.fn(), consume: jest.fn() },
}));

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

// Never send real email from tests
jest.mock('@/lib/email', () => ({
  sendOrderPlacedEmail: jest.fn().mockResolvedValue(undefined),
  sendAdminNewOrderEmail: jest.fn().mockResolvedValue(undefined),
}));

// Spy on the shared pricing function while keeping its real behaviour
jest.mock('@/lib/order-pricing', () => {
  const actual = jest.requireActual('@/lib/order-pricing');
  return { ...actual, priceOrder: jest.fn(actual.priceOrder) };
});

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { otpStore } from '@/lib/otp-store';
import { priceOrder } from '@/lib/order-pricing';
import { POST as placeOrder } from '@/app/api/checkout/verify-and-place-order/route';
import { POST as createOrder } from '@/app/api/orders/route';

const db = prisma as unknown as {
  product: { findMany: jest.Mock };
  shippingZone: { findFirst: jest.Mock };
  coupon: { findUnique: jest.Mock; update: jest.Mock };
  couponUsage: { count: jest.Mock; create: jest.Mock };
  user: { findFirst: jest.Mock; create: jest.Mock };
  addresses: { findUnique: jest.Mock; findFirst: jest.Mock; create: jest.Mock };
  order: { create: jest.Mock };
};

// ₹499 per 100 gm pack, 5 packs in stock
const PRODUCT = {
  id: 1, title: 'Oyster Powder', price: 499, quantity: 500, inStock: true,
  measurementValue: 100, measurementType: 'gm', discounts: [] as any[],
};
// Server pricing for 2 packs: 998 + (50 + 30) shipping + 12 fee = 1090
const SERVER_TOTAL = 1090;

const ADDRESS = { street: '1 Main St', city: 'Delhi', state: 'DL', zip: '110001', country: 'India' };

function request(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function checkoutBody(overrides: Record<string, unknown> = {}) {
  return {
    otp: '123456',
    email: 'shopper@example.com',
    customerName: 'Test Shopper',
    customerPhone: '9876543210',
    billingAddress: ADDRESS,
    shippingAddress: ADDRESS,
    cartItems: [{ id: 1, quantity: 2, price: 499 }],
    subtotal: 998,
    shippingFee: 80,
    convenienceFee: 12,
    total: SERVER_TOTAL,
    ...overrides,
  };
}

const placeOrderReq = (body: unknown) =>
  request('http://localhost:3000/api/checkout/verify-and-place-order', body);
const ordersReq = (body: unknown) => request('http://localhost:3000/api/orders', body);

beforeEach(() => {
  jest.clearAllMocks();
  (otpStore.verify as jest.Mock).mockResolvedValue({ valid: true });
  (otpStore.check as jest.Mock).mockResolvedValue({ valid: true, id: 'otp-1' });
  (otpStore.consume as jest.Mock).mockResolvedValue(true);
  (getServerSession as jest.Mock).mockResolvedValue({
    user: { id: 'user-1', email: 'shopper@example.com', name: 'Test Shopper', role: 'CUSTOMER' },
  });
  db.product.findMany.mockResolvedValue([PRODUCT]);
  db.shippingZone.findFirst.mockResolvedValue({ id: 3, name: 'Delhi NCR', baseFee: 30, estimatedDays: '3-5 days' });
  db.couponUsage.count.mockResolvedValue(0);
  db.addresses.create.mockImplementation(({ data }: any) => Promise.resolve({ ...data }));
  db.order.create.mockImplementation(({ data }: any) =>
    Promise.resolve({
      id: 'order-1',
      ...data,
      status: data.status ?? 'PENDING',
      orderItems: data.orderItems.create.map((i: any) => ({ ...i, product: { title: 'Oyster Powder', price: 499 } })),
    })
  );
});

function orderCreateData() {
  expect(db.order.create).toHaveBeenCalledTimes(1);
  return db.order.create.mock.calls[0][0].data;
}

describe('POST /api/checkout/verify-and-place-order', () => {
  it('calls the shared priceOrder with product IDs and quantities only', async () => {
    const res = await placeOrder(placeOrderReq(checkoutBody()));
    expect(res.status).toBe(200);
    expect(priceOrder).toHaveBeenCalledTimes(1);
    expect(priceOrder).toHaveBeenCalledWith({
      items: [{ productId: 1, quantity: 2 }],
      pincode: '110001',
      couponCode: undefined,
      email: 'shopper@example.com',
    });
  });

  it('ignores manipulated unit price, subtotal and fees and stores server values', async () => {
    const res = await placeOrder(
      placeOrderReq(
        checkoutBody({
          cartItems: [{ id: 1, quantity: 2, price: 1, discountedPrice: 1 }],
          subtotal: 2,
          shippingFee: 0,
          convenienceFee: 0,
          total: undefined, // no displayed total sent → nothing to compare
        })
      )
    );
    expect(res.status).toBe(200);

    const data = orderCreateData();
    expect(data).toMatchObject({ subtotal: 998, shipping: 80, tax: 12, couponDiscount: 0, total: SERVER_TOTAL });
    expect(data.orderItems.create).toEqual([{ productId: 1, quantity: 2, price: 499 }]);

    const json = await res.json();
    expect(json.order.total).toBe(SERVER_TOTAL);
    expect(json.pricing.total).toBe(SERVER_TOTAL);
  });

  it('rejects a manipulated total with 409 and the server breakdown, creating nothing', async () => {
    const res = await placeOrder(
      placeOrderReq(checkoutBody({ cartItems: [{ id: 1, quantity: 2, price: 1 }], subtotal: 2, total: 14 }))
    );
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.code).toBe('TOTAL_MISMATCH');
    expect(json.clientTotal).toBe(14);
    expect(json.pricing).toMatchObject({ subtotal: 998, shippingFee: 80, convenienceFee: 12, total: SERVER_TOTAL });
    expect(db.order.create).not.toHaveBeenCalled();
    expect(db.addresses.create).not.toHaveBeenCalled();
  });

  it('accepts a displayed total within ₹0.50 but stores the server total', async () => {
    const res = await placeOrder(placeOrderReq(checkoutBody({ total: SERVER_TOTAL + 0.4 })));
    expect(res.status).toBe(200);
    expect(orderCreateData().total).toBe(SERVER_TOTAL);
  });

  it('checks the coupon minimum against the SERVER subtotal, not the browser subtotal', async () => {
    db.coupon.findUnique.mockResolvedValue({
      id: 7, code: 'BIG', type: 'FIXED_AMOUNT', value: 200, minOrderValue: 1000, maxDiscount: null,
      maxUses: null, maxUsesPerEmail: 1, usedCount: 0, isActive: true,
      startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000),
    });
    // Browser claims ₹5000; server subtotal is 2 × 499 = 998
    const res = await placeOrder(placeOrderReq(checkoutBody({ couponCode: 'BIG', subtotal: 5000, total: 4950 })));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('Minimum order of ₹1000');
    expect(db.order.create).not.toHaveBeenCalled();
    expect(db.couponUsage.create).not.toHaveBeenCalled();
  });

  it('records coupon usage with the server-computed discount', async () => {
    db.coupon.findUnique.mockResolvedValue({
      id: 7, code: 'SAVE10', type: 'PERCENTAGE', value: 10, minOrderValue: 500, maxDiscount: null,
      maxUses: null, maxUsesPerEmail: 1, usedCount: 0, isActive: true,
      startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000),
    });
    // 10% of server subtotal 998 = ceil(99.8) = 100 → total 1090 - 100 = 990
    const res = await placeOrder(placeOrderReq(checkoutBody({ couponCode: 'SAVE10', subtotal: 99999, total: 990 })));
    expect(res.status).toBe(200);
    expect(orderCreateData()).toMatchObject({ couponId: 7, couponDiscount: 100, total: 990 });
    expect(db.couponUsage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ couponId: 7, discountAmount: 100, orderId: 'order-1' }),
    });
  });

  it.each([[0], [-2], [1.5], ['2']])('rejects quantity %p with 400', async (quantity) => {
    const res = await placeOrder(placeOrderReq(checkoutBody({ cartItems: [{ id: 1, quantity, price: 499 }] })));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_ITEMS');
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('rejects a quantity above available packs with 409', async () => {
    const res = await placeOrder(placeOrderReq(checkoutBody({ cartItems: [{ id: 1, quantity: 6, price: 499 }] })));
    expect(res.status).toBe(409);
    expect((await res.json()).stockErrors).toEqual(['"Oyster Powder" only has 5 unit(s) available']);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('rejects an undeliverable pincode', async () => {
    db.shippingZone.findFirst.mockResolvedValue(null);
    const res = await placeOrder(placeOrderReq(checkoutBody()));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('UNDELIVERABLE');
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('uses the pincode of a saved shipping address', async () => {
    db.addresses.findFirst.mockResolvedValue({ id: 'addr-9', ...ADDRESS, zip: '248001', userId: 'user-1' });
    const res = await placeOrder(
      placeOrderReq(checkoutBody({ shippingAddressId: 'addr-9', billingAddressId: 'addr-9', total: undefined }))
    );
    expect(res.status).toBe(200);
    expect(priceOrder).toHaveBeenCalledWith(expect.objectContaining({ pincode: '248001' }));
  });
});

describe('verify-and-place-order: OTP use and saved-address ownership', () => {
  it('keeps the OTP valid on a price change, then places the order at the confirmed total with the same code', async () => {
    const stale = await placeOrder(placeOrderReq(checkoutBody({ total: 1200 })));
    expect(stale.status).toBe(409);
    const body = await stale.json();
    expect(body.code).toBe('TOTAL_MISMATCH');
    expect(body.pricing.total).toBe(SERVER_TOTAL);
    expect(otpStore.consume).not.toHaveBeenCalled();
    expect(db.order.create).not.toHaveBeenCalled();

    const confirmed = await placeOrder(placeOrderReq(checkoutBody({ total: body.pricing.total })));
    expect(confirmed.status).toBe(200);
    expect(otpStore.check).toHaveBeenLastCalledWith('shopper@example.com', '123456');
    expect(otpStore.consume).toHaveBeenCalledWith('otp-1');
    expect(orderCreateData().total).toBe(SERVER_TOTAL);
  });

  it('does not use up the OTP when stock or delivery fails', async () => {
    const res = await placeOrder(placeOrderReq(checkoutBody({ cartItems: [{ id: 1, quantity: 9 }] })));
    expect(res.status).toBe(409);
    expect(otpStore.consume).not.toHaveBeenCalled();
  });

  it('rejects a wrong OTP before pricing', async () => {
    (otpStore.check as jest.Mock).mockResolvedValue({ valid: false, error: 'Invalid OTP. 2 attempt(s) remaining.' });
    const res = await placeOrder(placeOrderReq(checkoutBody()));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Invalid OTP/);
    expect(priceOrder).not.toHaveBeenCalled();
  });

  it('creates one order when two requests race for the same OTP', async () => {
    (otpStore.consume as jest.Mock).mockResolvedValue(false);
    const res = await placeOrder(placeOrderReq(checkoutBody()));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/already been used/);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('returns a payment token bound to the created order', async () => {
    const res = await placeOrder(placeOrderReq(checkoutBody()));
    const json = await res.json();
    const { isValidOrderPaymentToken } = jest.requireActual('@/lib/order-access');
    expect(isValidOrderPaymentToken('order-1', json.paymentToken)).toBe(true);
    expect(isValidOrderPaymentToken('order-2', json.paymentToken)).toBe(false);
  });

  it('returns a relative tracking link with a tracking token, not the payment token', async () => {
    const res = await placeOrder(placeOrderReq(checkoutBody()));
    const json = await res.json();
    const { isValidOrderTrackingToken } = jest.requireActual('@/lib/order-access');
    const url = new URL(json.trackingUrl, 'http://localhost');
    expect(json.trackingUrl.startsWith('/track?')).toBe(true);
    expect(isValidOrderTrackingToken('order-1', url.searchParams.get('token'))).toBe(true);
    expect(url.searchParams.get('token')).not.toBe(json.paymentToken);
    const { sendOrderPlacedEmail } = jest.requireMock('@/lib/email');
    expect(sendOrderPlacedEmail).toHaveBeenCalledWith(expect.objectContaining({ trackingUrl: json.trackingUrl }));
  });

  it("looks up saved addresses only among the signed-in shopper's own addresses", async () => {
    db.addresses.findFirst.mockResolvedValue(null); // addr-9 belongs to someone else
    const res = await placeOrder(placeOrderReq(checkoutBody({ shippingAddressId: 'addr-9', total: undefined })));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Selected shipping address not found');
    expect(db.addresses.findFirst).toHaveBeenCalledWith({ where: { id: 'addr-9', userId: 'user-1' } });
    expect(db.addresses.findUnique).not.toHaveBeenCalled();
    expect(otpStore.consume).not.toHaveBeenCalled();
  });

  it("rejects another account's billing address", async () => {
    db.addresses.findFirst.mockResolvedValue(null);
    const res = await placeOrder(placeOrderReq(checkoutBody({ billingAddressId: 'addr-other', total: undefined })));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Selected billing address not found');
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('does not let a guest use any saved address ID', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    db.user.findFirst.mockResolvedValue({ id: 'guest-user', email: 'guest@mushmush.in' });
    const res = await placeOrder(placeOrderReq(checkoutBody({ shippingAddressId: 'shipping-123-abc', total: undefined })));
    expect(res.status).toBe(400);
    expect(db.addresses.findFirst).not.toHaveBeenCalled();
    expect(db.order.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/orders (signed-in)', () => {
  function ordersBody(overrides: Record<string, unknown> = {}) {
    return {
      customerName: 'Test Shopper',
      customerEmail: 'shopper@example.com',
      shippingAddress: ADDRESS,
      orderItems: [{ productId: 1, quantity: 2, price: 1 }],
      subtotal: 2,
      tax: 0,
      shipping: 0,
      ...overrides,
    };
  }

  it('requires a session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await createOrder(ordersReq(ordersBody()));
    expect(res.status).toBe(401);
    expect(priceOrder).not.toHaveBeenCalled();
  });

  it('calls the shared priceOrder and stores server values, ignoring submitted amounts', async () => {
    const res = await createOrder(ordersReq(ordersBody()));
    expect(res.status).toBe(201);
    expect(priceOrder).toHaveBeenCalledWith({ items: [{ productId: 1, quantity: 2 }], pincode: '110001' });

    const data = orderCreateData();
    expect(data).toMatchObject({ subtotal: 998, shipping: 80, tax: 12, total: SERVER_TOTAL, userId: 'user-1' });
    expect(data.orderItems.create).toEqual([{ productId: 1, quantity: 2, price: 499 }]);
  });

  it('rejects a manipulated total with 409', async () => {
    const res = await createOrder(ordersReq(ordersBody({ total: 2 })));
    expect(res.status).toBe(409);
    expect((await res.json()).pricing.total).toBe(SERVER_TOTAL);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('rejects bad quantities and stock overflow', async () => {
    let res = await createOrder(ordersReq(ordersBody({ orderItems: [{ productId: 1, quantity: 0 }] })));
    expect(res.status).toBe(400);
    res = await createOrder(ordersReq(ordersBody({ orderItems: [{ productId: 1, quantity: 2.5 }] })));
    expect(res.status).toBe(400);
    res = await createOrder(ordersReq(ordersBody({ orderItems: [{ productId: 1, quantity: 99 }] })));
    expect(res.status).toBe(409);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('rejects coupons (not supported on this route)', async () => {
    const res = await createOrder(ordersReq(ordersBody({ couponCode: 'SAVE10' })));
    expect(res.status).toBe(400);
    expect(db.order.create).not.toHaveBeenCalled();
  });
});
