/**
 * @jest-environment node
 *
 * Security tests: a training registration must stay PENDING until either
 * (a) a verified payment tied to THAT registration is recorded, or
 * (b) an authenticated ADMIN confirms it.
 *
 * Covers POST /api/quick-verify-payment, POST /api/upi-webhook,
 * POST /api/training-payments and src/lib/payment-verifier.ts.
 */

jest.mock("next/server",()=>({...jest.requireActual("next/server"),after:jest.fn()}));
jest.mock("@/lib/staff-jobs",()=>({runStaffJobs:jest.fn()}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    trainingRegistration: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    upi_payments: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    $queryRaw: jest.fn(),
    staffJob: { upsert: jest.fn() },
    staffEvent: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

// Never send real email from tests
jest.mock('@/lib/email', () => ({
  sendPaymentConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServerSession as getServerSessionNext } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import { quickVerifyPayment } from '@/lib/payment-verifier';
import { isValidWebhookSignature } from '@/lib/webhook-signature';
import { POST as quickVerify } from '@/app/api/quick-verify-payment/route';
import { POST as webhook } from '@/app/api/upi-webhook/route';
import { GET as trainingPaymentStatus, POST as submitTrainingPayment } from '@/app/api/training-payments/route';

const db = prisma as unknown as {
  trainingRegistration: { findUnique: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  upi_payments: { findUnique: jest.Mock; findFirst: jest.Mock; create: jest.Mock; updateMany: jest.Mock; update: jest.Mock };
  staffJob: {upsert: jest.Mock};
  $transaction: jest.Mock;
};

const REGISTRATION = {
  id: 'reg-1',
  registrationNumber: 'REG-001',
  status: 'PENDING',
  participantName: 'Asha',
  participantEmail: 'asha@example.com',
  totalAmount: 4999,
  userId: 'user-1',
  trainingProgram: { name: 'Oyster Basics', duration: 3, dailyHours: '5-6 hours' },
  upi_payments: [] as any[],
};

const TXN = 'UPI1234567890AB';
const SECRET = 'test-webhook-secret';

function expectNothingConfirmed() {
  expect(db.trainingRegistration.update).not.toHaveBeenCalled();
  expect(db.upi_payments.create).not.toHaveBeenCalled();
  expect(db.upi_payments.updateMany).not.toHaveBeenCalled();
  expect(db.upi_payments.update).not.toHaveBeenCalled();
  expect(sendPaymentConfirmationEmail).not.toHaveBeenCalled();
}

function expectNoAmountLookup() {
  for (const call of db.trainingRegistration.findFirst.mock.calls) {
    expect(JSON.stringify(call[0])).not.toContain('totalAmount');
  }
}

beforeEach(() => {
  jest.resetAllMocks();
  db.$transaction.mockImplementation(async work => typeof work === "function" ? work(db) : Promise.all(work));
  db.upi_payments.updateMany.mockResolvedValue({count:1});
  db.trainingRegistration.findUnique.mockResolvedValue({ ...REGISTRATION });
  db.trainingRegistration.findFirst.mockResolvedValue({ ...REGISTRATION }); // would match "by amount"
  db.trainingRegistration.update.mockImplementation(({ data }: any) =>
    Promise.resolve({ ...REGISTRATION, ...data })
  );
  db.upi_payments.findUnique.mockResolvedValue(null);
  db.upi_payments.findFirst.mockResolvedValue(null);
  db.upi_payments.create.mockImplementation(({ data }: any) => Promise.resolve({ ...data, createdAt: new Date() }));
  db.upi_payments.update.mockImplementation(({ data }: any) => Promise.resolve({ ...data, createdAt: new Date() }));
});

// ── /api/quick-verify-payment ─────────────────────────────────────────

describe('POST /api/quick-verify-payment', () => {
  const req = (body: unknown) =>
    new NextRequest('http://localhost:3000/api/quick-verify-payment', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  it('returns 401 without a session and confirms nothing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await quickVerify(req({ registrationId: 'reg-1', transactionId: TXN, amount: 4999 }));
    expect(res.status).toBe(401);
    expect(db.trainingRegistration.findUnique).not.toHaveBeenCalled();
    expect(db.trainingRegistration.findFirst).not.toHaveBeenCalled();
    expectNothingConfirmed();
  });

  it('returns 403 for a non-admin user and confirms nothing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u-2', role: 'CUSTOMER' } });
    const res = await quickVerify(req({ registrationId: 'reg-1', transactionId: TXN, amount: 4999 }));
    expect(res.status).toBe(403);
    expect(db.trainingRegistration.findUnique).not.toHaveBeenCalled();
    expectNothingConfirmed();
  });

  it('never confirms from an amount alone, even for an admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    const res = await quickVerify(req({ transactionId: TXN, amount: 4999 }));
    expect(res.status).toBe(400);
    expect(db.trainingRegistration.findFirst).not.toHaveBeenCalled();
    expectNothingConfirmed();
  });

  it('confirms the named registration for an admin and records who verified it', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    const res = await quickVerify(req({ registrationId: 'reg-1', transactionId: TXN }));
    expect(res.status).toBe(200);

    expect(db.trainingRegistration.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' } })
    );
    expect(db.trainingRegistration.findFirst).not.toHaveBeenCalled();
    expect(db.upi_payments.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'VERIFIED',
        transactionId: TXN,
        trainingRegistrationId: 'reg-1',
        verifiedByUserId: 'admin-1',
        amount: 4999,
      }),
    });
    expect(db.trainingRegistration.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { status: 'CONFIRMED' } })
    );
    expect(db.staffJob.upsert).toHaveBeenCalledWith(expect.objectContaining({where:{key:"training/reg-1"}}));
  });

  it('rejects an amount that does not match the named registration', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    const res = await quickVerify(req({ registrationId: 'reg-1', transactionId: TXN, amount: 1 }));
    expect(res.status).toBe(409);
    expectNothingConfirmed();
  });

  it('rejects a transaction ID already used by another registration', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    db.upi_payments.findUnique.mockResolvedValue({ id: 'p-9', transactionId: TXN, trainingRegistrationId: 'reg-OTHER' });
    const res = await quickVerify(req({ registrationId: 'reg-1', transactionId: TXN }));
    expect(res.status).toBe(409);
    expectNothingConfirmed();
  });

  it('rejects a registration that is not PENDING', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    db.trainingRegistration.findUnique.mockResolvedValue({ ...REGISTRATION, status: 'CANCELLED' });
    const res = await quickVerify(req({ registrationId: 'reg-1', transactionId: TXN }));
    expect(res.status).toBe(409);
    expectNothingConfirmed();
  });
});

describe('quickVerifyPayment (lib)', () => {
  it('requires a registration ID and verifier; amount alone does nothing', async () => {
    const result = await quickVerifyPayment({ transactionId: TXN, amount: 4999 } as any);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(db.trainingRegistration.findFirst).not.toHaveBeenCalled();
    expect(db.trainingRegistration.findUnique).not.toHaveBeenCalled();
    expectNothingConfirmed();
  });

  it('never looks a registration up by amount', async () => {
    await quickVerifyPayment({ registrationId: 'reg-1', transactionId: TXN, amount: 4999, verifiedByUserId: 'admin-1' });
    expectNoAmountLookup();
    expect(db.trainingRegistration.findFirst).not.toHaveBeenCalled();
  });
});

// ── /api/upi-webhook ──────────────────────────────────────────────────

describe('POST /api/upi-webhook', () => {
  const sign = (raw: string, secret = SECRET) => createHmac('sha256', secret).update(raw).digest('hex');

  const req = (raw: string, signature?: string) =>
    new NextRequest('http://localhost:3000/api/upi-webhook', {
      method: 'POST',
      body: raw,
      headers: {
        'Content-Type': 'application/json',
        ...(signature !== undefined ? { 'x-webhook-signature': signature } : {}),
      },
    });

  const payload = (overrides: Record<string, unknown> = {}) =>
    JSON.stringify({ registrationId: 'reg-1', transactionId: TXN, amount: 4999, status: 'SUCCESS', ...overrides });

  const originalSecret = process.env.UPI_WEBHOOK_SECRET;
  beforeEach(() => {
    process.env.UPI_WEBHOOK_SECRET = SECRET;
  });
  afterAll(() => {
    if (originalSecret === undefined) delete process.env.UPI_WEBHOOK_SECRET;
    else process.env.UPI_WEBHOOK_SECRET = originalSecret;
  });

  function expectUntouched() {
    expect(db.trainingRegistration.findUnique).not.toHaveBeenCalled();
    expect(db.trainingRegistration.findFirst).not.toHaveBeenCalled();
    expectNothingConfirmed();
  }

  it('rejects everything when UPI_WEBHOOK_SECRET is not configured (fail closed)', async () => {
    delete process.env.UPI_WEBHOOK_SECRET;
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const raw = payload();
    const res = await webhook(req(raw, sign(raw)));
    expect(res.status).toBe(503);
    expectUntouched();
    errorSpy.mockRestore();
  });

  it('rejects a request with no signature', async () => {
    const res = await webhook(req(payload()));
    expect(res.status).toBe(401);
    expectUntouched();
  });

  it('rejects a signature made with the wrong secret', async () => {
    const raw = payload();
    const res = await webhook(req(raw, sign(raw, 'wrong-secret')));
    expect(res.status).toBe(401);
    expectUntouched();
  });

  it('rejects a malformed signature', async () => {
    const res = await webhook(req(payload(), 'not-a-signature'));
    expect(res.status).toBe(401);
    expectUntouched();
  });

  it('rejects a valid signature for a different (tampered) body', async () => {
    const signedFor = payload({ amount: 1 });
    const res = await webhook(req(payload(), sign(signedFor)));
    expect(res.status).toBe(401);
    expectUntouched();
  });

  it('never confirms from an amount alone, even with a valid signature', async () => {
    const raw = JSON.stringify({ transactionId: TXN, amount: 4999, status: 'SUCCESS' });
    const res = await webhook(req(raw, sign(raw)));
    expect(res.status).toBe(400);
    expectUntouched();
  });

  it('does not confirm when the amount does not match the named registration', async () => {
    const raw = payload({ amount: 1 });
    const res = await webhook(req(raw, sign(raw)));
    expect(res.status).toBe(409);
    expectNothingConfirmed();
  });

  it('rejects a payment record that belongs to another registration', async () => {
    db.upi_payments.findUnique.mockResolvedValue({ id: 'pay-1', status: 'PENDING', trainingRegistrationId: 'reg-OTHER' });
    const raw = payload({ paymentId: 'pay-1' });
    const res = await webhook(req(raw, sign(raw)));
    expect(res.status).toBe(409);
    expectNothingConfirmed();
  });

  it('confirms only the referenced registration with a valid signature (sha256= prefix accepted)', async () => {
    db.upi_payments.findUnique.mockResolvedValue({ id:'pay-1', transactionId:TXN, amount:4999, status:'PENDING', trainingRegistrationId:'reg-1' });
    const raw = payload();
    const res = await webhook(req(raw, `sha256=${sign(raw)}`));
    expect(res.status).toBe(200);

    expect(db.trainingRegistration.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' } })
    );
    expectNoAmountLookup();
    expect(db.upi_payments.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'pay-1', status:'PENDING' }, data: expect.objectContaining({ status: 'VERIFIED' }) })
    );
    expect(db.trainingRegistration.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { status: 'CONFIRMED' } })
    );
  });

  it('isValidWebhookSignature rejects missing secret or signature', () => {
    const raw = payload();
    expect(isValidWebhookSignature(raw, sign(raw), SECRET)).toBe(true);
    expect(isValidWebhookSignature(raw, sign(raw), '')).toBe(false);
    expect(isValidWebhookSignature(raw, sign(raw), undefined)).toBe(false);
    expect(isValidWebhookSignature(raw, null, SECRET)).toBe(false);
    expect(isValidWebhookSignature(raw, sign(raw).slice(0, 63), SECRET)).toBe(false);
  });
});

// ── /api/training-payments (customer submits a UPI reference) ─────────

describe('POST /api/training-payments', () => {
  const OWNER = { user: { id: 'user-1', email: 'asha@example.com', role: 'CUSTOMER' } };
  const submit = () => {
    const form = new FormData();
    form.append('registrationId', 'reg-1');
    form.append('paymentMethod', 'UPI');
    form.append('upiTransactionId', TXN);
    form.append('upiId', 'someone@upi');
    form.append('amount', '4999');
    return submitTrainingPayment(
      new NextRequest('http://localhost:3000/api/training-payments', { method: 'POST', body: form })
    );
  };

  it('records the owner-typed reference as PENDING and leaves the registration PENDING', async () => {
    (getServerSessionNext as jest.Mock).mockResolvedValue(OWNER);
    const res = await submit();
    expect(res.status).toBe(200);

    expect(db.upi_payments.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'PENDING', trainingRegistrationId: 'reg-1', transactionId: TXN }),
    });
    expect(db.trainingRegistration.update).not.toHaveBeenCalled();
    expect(sendPaymentConfirmationEmail).not.toHaveBeenCalled();
    expect((await res.json()).registration.status).toBe('PENDING');
  });

  it('requires a signed-in account', async () => {
    (getServerSessionNext as jest.Mock).mockResolvedValue(null);
    const res = await submit();
    expect(res.status).toBe(401);
    expectNothingConfirmed();
  });

  it("answers 404 for another account's registration and records nothing", async () => {
    (getServerSessionNext as jest.Mock).mockResolvedValue({ user: { id: 'user-2', email: 'b@example.com', role: 'CUSTOMER' } });
    const res = await submit();
    expect(res.status).toBe(404);
    expectNothingConfirmed();
  });

  it('rejects a registration that is no longer awaiting payment', async () => {
    (getServerSessionNext as jest.Mock).mockResolvedValue(OWNER);
    db.trainingRegistration.findUnique.mockResolvedValue({ ...REGISTRATION, status: 'CANCELLED' });
    const res = await submit();
    expect(res.status).toBe(409);
    expectNothingConfirmed();
  });
});

describe('GET /api/training-payments', () => {
  const status = () =>
    trainingPaymentStatus(new NextRequest('http://localhost:3000/api/training-payments?registrationId=reg-1'));

  it("shows the owner their registration (compares the registration's user, not its ID)", async () => {
    (getServerSessionNext as jest.Mock).mockResolvedValue({ user: { id: 'user-1', role: 'CUSTOMER' } });
    const res = await status();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('reg-1');
    expect(json).not.toHaveProperty('userId');
  });

  it('lets an admin see any registration', async () => {
    (getServerSessionNext as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    expect((await status()).status).toBe(200);
  });

  it('hides the registration from other accounts and from signed-out visitors', async () => {
    (getServerSessionNext as jest.Mock).mockResolvedValue({ user: { id: 'user-2', role: 'CUSTOMER' } });
    expect((await status()).status).toBe(404);
    (getServerSessionNext as jest.Mock).mockResolvedValue(null);
    expect((await status()).status).toBe(401);
  });
});
