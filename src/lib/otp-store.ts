// OTP Store - Database-backed storage with hashing and attempt tracking
import { prisma } from './prisma';
import { createHash } from 'crypto';

const MAX_ATTEMPTS = 3;

/** Hash OTP with SHA-256 before storage — raw OTP never persisted */
function hashOTP(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

interface OTPData {
  otp: string;       // raw OTP (will be hashed before storage)
  expiresAt: number;
  phone?: string;
}

export const otpStore = {
  async set(email: string, data: OTPData): Promise<void> {
    try {
      // Delete any existing OTP for this email
      await prisma.oTP.deleteMany({
        where: { email: email.toLowerCase() }
      });

      // Create new OTP with hashed value
      await prisma.oTP.create({
        data: {
          email: email.toLowerCase(),
          otp: hashOTP(data.otp),
          phone: data.phone || null,
          attempts: 0,
          expiresAt: new Date(data.expiresAt)
        }
      });
    } catch (error) {
      console.error('OTP store error:', error);
      throw error;
    }
  },

  /**
   * Verify an OTP. Returns true if valid, false if wrong/expired/too many attempts.
   * Automatically increments attempt counter and invalidates after MAX_ATTEMPTS.
   */
  async verify(email: string, otpInput: string): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      const record = await prisma.oTP.findFirst({
        where: {
          email: email.toLowerCase(),
          expiresAt: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!record) {
        return { valid: false, error: 'OTP not found or expired. Please request a new OTP.' };
      }

      if (record.attempts >= MAX_ATTEMPTS) {
        // Invalidate the OTP
        await prisma.oTP.deleteMany({ where: { email: email.toLowerCase() } });
        return { valid: false, error: 'Too many failed attempts. Please request a new OTP.' };
      }

      const hashedInput = hashOTP(otpInput);
      if (hashedInput !== record.otp) {
        // Increment attempt counter
        await prisma.oTP.update({
          where: { id: record.id },
          data: { attempts: { increment: 1 } }
        });
        const remaining = MAX_ATTEMPTS - record.attempts - 1;
        return {
          valid: false,
          error: remaining > 0
            ? `Invalid OTP. ${remaining} attempt(s) remaining.`
            : 'Too many failed attempts. Please request a new OTP.'
        };
      }

      // OTP is valid — delete it (single use)
      await prisma.oTP.deleteMany({ where: { email: email.toLowerCase() } });
      return { valid: true };
    } catch (error) {
      console.error('OTP verify error:', error);
      return { valid: false, error: 'Verification failed. Please try again.' };
    }
  },

  /** Legacy get method — kept for backward compatibility but prefer verify() */
  async get(email: string): Promise<{ otp: string; expiresAt: number } | undefined> {
    try {
      const record = await prisma.oTP.findFirst({
        where: {
          email: email.toLowerCase(),
          expiresAt: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!record) return undefined;

      return {
        otp: record.otp, // This is now the hash
        expiresAt: record.expiresAt.getTime()
      };
    } catch (error) {
      console.error('OTP retrieval error:', error);
      return undefined;
    }
  },

  async delete(email: string): Promise<void> {
    try {
      await prisma.oTP.deleteMany({
        where: { email: email.toLowerCase() }
      });
    } catch (error) {
      console.error('OTP delete error:', error);
    }
  },

  async checkRateLimit(email: string): Promise<{
    allowed: boolean;
    message?: string;
    retryAfter?: number;
  }> {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Check if OTP was sent in the last 1 minute
      const recentOTP = await prisma.oTP.findFirst({
        where: {
          email: email.toLowerCase(),
          createdAt: { gte: oneMinuteAgo }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (recentOTP) {
        const secondsSinceLastOTP = Math.floor((now.getTime() - recentOTP.createdAt.getTime()) / 1000);
        const retryAfter = 60 - secondsSinceLastOTP;
        return {
          allowed: false,
          message: `Please wait ${retryAfter} seconds before requesting a new OTP.`,
          retryAfter
        };
      }

      // Check total OTP requests in last 5 minutes
      const otpCount = await prisma.oTP.count({
        where: {
          email: email.toLowerCase(),
          createdAt: { gte: fiveMinutesAgo }
        }
      });

      if (otpCount >= 3) {
        return {
          allowed: false,
          message: 'Maximum OTP requests reached. Please try again after 5 minutes.',
          retryAfter: 300
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true };
    }
  }
};

// Lazy cleanup: purge expired OTPs at most once every 5 minutes
let lastCleanup = 0;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

export async function cleanupExpiredOTPs() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  try {
    await prisma.oTP.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
  } catch {
    // Silently fail — cleanup is best-effort
  }
}
