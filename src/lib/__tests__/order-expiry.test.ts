/**
 * @jest-environment node
 */
type Row = { id: string; orderNumber: string; status: string; createdAt: Date; payments: number };
const db = {
  orders: [] as Row[],
  usages: [] as { id: string; orderId: string; couponId: number }[],
  coupons: [] as { id: number; usedCount: number }[],
};
const matches = (o: Row, where: any) =>
  (!where.id || o.id === where.id) && (!where.status || o.status === where.status) &&
  (!where.createdAt || o.createdAt < where.createdAt.lt) && (!where.upi_payments || o.payments === 0);
const client = {
  order: {
    findMany: jest.fn(async ({ where }: any) => db.orders.filter(o => matches(o, where)).map(({ id, orderNumber }) => ({ id, orderNumber }))),
    updateMany: jest.fn(async ({ where, data }: any) => {
      const hit = db.orders.filter(o => matches(o, where));
      hit.forEach(o => Object.assign(o, data));
      return { count: hit.length };
    }),
  },
  couponUsage: {
    findUnique: jest.fn(async ({ where }: any) => db.usages.find(u => u.orderId === where.orderId) ?? null),
    delete: jest.fn(async ({ where }: any) => { db.usages = db.usages.filter(u => u.id !== where.id); }),
  },
  coupon: {
    updateMany: jest.fn(async ({ where, data }: any) => {
      const hit = db.coupons.filter(c => c.id === where.id && c.usedCount > where.usedCount.gt);
      hit.forEach(c => { c.usedCount -= data.usedCount.decrement; });
      return { count: hit.length };
    }),
  },
};
jest.mock('@/lib/prisma', () => ({ get prisma() { return { ...client, $transaction: (fn: (tx: typeof client) => unknown) => fn(client) }; } }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expireUnpaidOrders } = require('@/lib/order-expiry') as typeof import('@/lib/order-expiry');

const now = new Date('2026-11-25T12:00:00Z');
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);

beforeEach(() => {
  db.orders = [
    { id: 'o-old', orderNumber: 'ORD-1', status: 'PENDING', createdAt: hoursAgo(49), payments: 0 },
    { id: 'o-coupon', orderNumber: 'ORD-2', status: 'PENDING', createdAt: hoursAgo(72), payments: 0 },
    { id: 'o-new', orderNumber: 'ORD-3', status: 'PENDING', createdAt: hoursAgo(47), payments: 0 },
    { id: 'o-paid', orderNumber: 'ORD-4', status: 'PENDING', createdAt: hoursAgo(80), payments: 1 },
    { id: 'o-received', orderNumber: 'ORD-5', status: 'PAYMENT_RECEIVED', createdAt: hoursAgo(80), payments: 1 },
    { id: 'o-confirmed', orderNumber: 'ORD-6', status: 'CONFIRMED', createdAt: hoursAgo(80), payments: 0 },
  ];
  db.usages = [{ id: 'u1', orderId: 'o-coupon', couponId: 7 }, { id: 'u2', orderId: 'o-confirmed', couponId: 7 }];
  db.coupons = [{ id: 7, usedCount: 2 }];
});

const status = (id: string) => db.orders.find(o => o.id === id)!.status;

describe('expireUnpaidOrders', () => {
  it('cancels only PENDING orders older than 48 hours with no payment', async () => {
    const { cancelled } = await expireUnpaidOrders(now);
    expect(cancelled.sort()).toEqual(['ORD-1', 'ORD-2']);
    expect(status('o-old')).toBe('CANCELLED');
    expect(status('o-new')).toBe('PENDING');
    expect(status('o-paid')).toBe('PENDING');
    expect(status('o-received')).toBe('PAYMENT_RECEIVED');
    expect(status('o-confirmed')).toBe('CONFIRMED');
  });

  it("releases the cancelled order's coupon use and leaves other uses alone", async () => {
    await expireUnpaidOrders(now);
    expect(db.usages.map(u => u.id)).toEqual(['u2']);
    expect(db.coupons[0].usedCount).toBe(1);
  });

  it('never takes the coupon count below zero', async () => {
    db.coupons[0].usedCount = 0;
    await expireUnpaidOrders(now);
    expect(db.coupons[0].usedCount).toBe(0);
    expect(db.usages.map(u => u.id)).toEqual(['u2']);
  });

  it('skips an order that received a payment after the first query', async () => {
    client.order.findMany.mockImplementationOnce(async () => {
      db.orders.find(o => o.id === 'o-old')!.payments = 1;
      return [{ id: 'o-old', orderNumber: 'ORD-1' }];
    });
    const { cancelled } = await expireUnpaidOrders(now);
    expect(cancelled).toEqual([]);
    expect(status('o-old')).toBe('PENDING');
  });

  it('uses the hours argument for the cutoff', async () => {
    const { cancelled } = await expireUnpaidOrders(now, 100);
    expect(cancelled).toEqual([]);
  });
});
