/**
 * @jest-environment node
 */
jest.mock('@/lib/order-expiry', () => ({ expireUnpaidOrders: jest.fn() }));
import { NextRequest } from 'next/server';
import { expireUnpaidOrders } from '@/lib/order-expiry';
import { GET, POST } from '@/app/api/cron/expire-orders/route';

const call = (handler: typeof GET, authorization?: string) =>
  handler(new NextRequest('http://localhost/api/cron/expire-orders', { headers: authorization ? { authorization } : {} }));

beforeEach(() => {
  (expireUnpaidOrders as jest.Mock).mockReset().mockResolvedValue({ cancelled: ['ORD-1', 'ORD-2'] });
  process.env.CRON_SECRET = 'cron-test-secret';
});
afterAll(() => { delete process.env.CRON_SECRET; });

describe('/api/cron/expire-orders', () => {
  it('answers 503 and cancels nothing when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;
    const res = await call(GET, 'Bearer anything');
    expect(res.status).toBe(503);
    expect(expireUnpaidOrders).not.toHaveBeenCalled();
  });

  it.each([undefined, 'Bearer wrong', 'cron-test-secret', 'bearer cron-test-secret', 'Bearer cron-test-secreT'])('answers 401 for authorization %p', async (header) => {
    const res = await call(GET, header);
    expect(res.status).toBe(401);
    expect(expireUnpaidOrders).not.toHaveBeenCalled();
  });

  it('returns the number of cancelled orders for GET and POST', async () => {
    for (const handler of [GET, POST]) {
      const res = await call(handler, 'Bearer cron-test-secret');
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ cancelled: 2, orderNumbers: ['ORD-1', 'ORD-2'] });
    }
    expect(expireUnpaidOrders).toHaveBeenCalledTimes(2);
  });
});
