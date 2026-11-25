/**
 * @jest-environment node
 *
 * POST /api/checkout/upi-payment accepts a payment only from the browser that
 * created the order (payment token from verified checkout) or the signed-in
 * owner, and only while the order is awaiting payment. Order numbers are
 * guessable timestamps, so the number alone must not be enough.
 */

jest.mock("next/server",()=>({...jest.requireActual("next/server"),after:jest.fn()}));
jest.mock("@/lib/staff-jobs",()=>({runStaffJobs:jest.fn()}));
process.env.NEXTAUTH_SECRET = 'test-secret';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findFirst: jest.fn(), updateMany: jest.fn().mockResolvedValue({count:1}), update: jest.fn() },
    product: { findUniqueOrThrow: jest.fn().mockResolvedValue({id:1, title:"Cumin", inStock:true, quantity:1000, measurementValue:100, measurementType:"gm"}),update:jest.fn() },
    orderItem: { update: jest.fn() }, staffEvent: { create: jest.fn() },
    staffJob: {createMany: jest.fn()},
    $queryRaw: jest.fn(), $transaction: jest.fn(),
    upi_payments: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
  },
}));

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/email', () => ({ sendPaymentReceivedEmail: jest.fn().mockResolvedValue(undefined) }));
jest.mock('fs/promises', () => ({ writeFile: jest.fn() }));

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

import { createOrderPaymentToken } from '@/lib/order-access';
import { POST as submitPayment } from '@/app/api/checkout/upi-payment/route';

const db = prisma as unknown as {
  $transaction: jest.Mock;
  order: { findFirst: jest.Mock; update: jest.Mock };
  upi_payments: { findFirst: jest.Mock; create: jest.Mock; delete: jest.Mock };
};

const ORDER = {
  id: 'order-1', orderNumber: 'ORD-1700000000000', status: 'PENDING', total: 241, subtotal: 149, shipping: 80,
  userId: 'guest-user', customerName: 'Guest', customerEmail: 'guest-shopper@example.com', customerPhone: '',
  shippingAddress: {}, orderItems: [{ id:'line-1', productId: 1, quantity: 1, price: 149, product: { title: 'Cumin Seeds' } }],
};

function submit(fields: Record<string, string>) {
  const form = new FormData();
  const all: Record<string, string> = { orderNumber: ORDER.orderNumber, upiTransactionId: 'UPI1234567890AB', amount: '241', ...fields };
  for (const [key, value] of Object.entries(all)) form.append(key, value);
  return submitPayment(new NextRequest('http://localhost:3000/api/checkout/upi-payment', { method: 'POST', body: form }));
}

beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue(null);
  db.order.findFirst.mockResolvedValue({ ...ORDER });
  db.upi_payments.findFirst.mockResolvedValue(null);
  db.upi_payments.create.mockImplementation(({ data }: any) => Promise.resolve(data));
  db.$transaction.mockImplementation(work=>work(db));
});

function expectNothingRecorded() {
  expect(db.upi_payments.create).not.toHaveBeenCalled();
  expect(db.$transaction).not.toHaveBeenCalled();
  expect(db.order.update).not.toHaveBeenCalled();
}

describe('POST /api/checkout/upi-payment ownership', () => {
  it('answers 404 to a guest who knows only the order number', async () => {
    const res = await submit({});
    expect(res.status).toBe(404);
    expectNothingRecorded();
  });

  it('rejects a token made for another order', async () => {
    const res = await submit({ paymentToken: createOrderPaymentToken('order-2') });
    expect(res.status).toBe(404);
    expectNothingRecorded();
  });

  it('accepts the guest browser that created the order and records the stored total', async () => {
    const res = await submit({ paymentToken: createOrderPaymentToken('order-1') });
    expect(res.status).toBe(200);
    expect(db.upi_payments.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ orderId: 'order-1', amount: 241, status: 'PENDING' }),
    });
  });

  it('accepts the signed-in owner without a token', async () => {
    db.order.findFirst.mockResolvedValue({ ...ORDER, userId: 'user-1' });
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1', email: 'a@example.com' } });
    expect((await submit({})).status).toBe(200);
  });

  it("rejects a signed-in account that does not own the order", async () => {
    db.order.findFirst.mockResolvedValue({ ...ORDER, userId: 'user-1' });
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-2', email: 'b@example.com' } });
    expect((await submit({})).status).toBe(404);
    expectNothingRecorded();
  });

  it('does not treat the shared guest account as an owner', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'guest-user', email: 'guest@mushmush.in' } });
    expect((await submit({})).status).toBe(404);
    expectNothingRecorded();
  });

  it('rejects payment for an order that is not awaiting payment', async () => {
    db.order.findFirst.mockResolvedValue({ ...ORDER, status: 'CANCELLED' });
    const res = await submit({ paymentToken: createOrderPaymentToken('order-1') });
    expect(res.status).toBe(409);
    expectNothingRecorded();
  });
});
