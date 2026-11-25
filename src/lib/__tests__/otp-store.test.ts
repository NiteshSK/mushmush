/**
 * @jest-environment node
 *
 * Checkout checks the OTP first and uses it up only when the order is created.
 */
jest.mock('@/lib/prisma', () => ({
  prisma: { oTP: { findFirst: jest.fn(), update: jest.fn(), deleteMany: jest.fn() } },
}));

import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { otpStore } from '@/lib/otp-store';

const db = prisma as unknown as { oTP: { findFirst: jest.Mock; update: jest.Mock; deleteMany: jest.Mock } };
const record = (attempts = 0) => ({
  id: 'otp-1', email: 'a@example.com', attempts, otp: createHash('sha256').update('123456').digest('hex'),
});

beforeEach(() => {
  jest.clearAllMocks();
  db.oTP.findFirst.mockResolvedValue(record());
  db.oTP.deleteMany.mockResolvedValue({ count: 1 });
});

describe('otpStore.check and consume', () => {
  it('accepts the right code without using it up', async () => {
    expect(await otpStore.check('A@example.com', '123456')).toEqual({ valid: true, id: 'otp-1' });
    expect(db.oTP.deleteMany).not.toHaveBeenCalled();
  });

  it('counts a wrong code as an attempt', async () => {
    const result = await otpStore.check('a@example.com', '000000');
    expect(result).toEqual({ valid: false, error: 'Invalid OTP. 2 attempt(s) remaining.' });
    expect(db.oTP.update).toHaveBeenCalledWith({ where: { id: 'otp-1' }, data: { attempts: { increment: 1 } } });
  });

  it('refuses after too many attempts, even with the right code', async () => {
    db.oTP.findFirst.mockResolvedValue(record(3));
    expect((await otpStore.check('a@example.com', '123456')).valid).toBe(false);
  });

  it('lets only one request use up a code', async () => {
    expect(await otpStore.consume('otp-1')).toBe(true);
    db.oTP.deleteMany.mockResolvedValue({ count: 0 });
    expect(await otpStore.consume('otp-1')).toBe(false);
  });

  it('verify() still checks and uses up the code in one step', async () => {
    expect(await otpStore.verify('a@example.com', '123456')).toEqual({ valid: true });
    expect(db.oTP.deleteMany).toHaveBeenCalledWith({ where: { id: 'otp-1' } });
  });
});
