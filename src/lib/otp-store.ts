// OTP Store - Database-backed storage for OTP verification
import { prisma } from './prisma';

interface OTPData {
  otp: string;
  expiresAt: number;
}

// Database-backed OTP store
export const otpStore = {
  async set(email: string, data: OTPData): Promise<void> {
    try {
      // Delete any existing OTP for this email
      await prisma.oTP.deleteMany({
        where: { email: email.toLowerCase() }
      });

      // Create new OTP
      await prisma.oTP.create({
        data: {
          email: email.toLowerCase(),
          otp: data.otp,
          expiresAt: new Date(data.expiresAt)
        }
      });
      console.log('💾 OTP stored in database for:', email);
    } catch (error) {
      console.error('❌ Error storing OTP:', error);
      throw error;
    }
  },

  async get(email: string): Promise<OTPData | undefined> {
    try {
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          email: email.toLowerCase(),
          expiresAt: {
            gte: new Date() // Only get non-expired OTPs
          }
        },
        orderBy: {
          createdAt: 'desc' // Get the most recent one
        }
      });

      if (!otpRecord) {
        return undefined;
      }

      return {
        otp: otpRecord.otp,
        expiresAt: otpRecord.expiresAt.getTime()
      };
    } catch (error) {
      console.error('❌ Error retrieving OTP:', error);
      return undefined;
    }
  },

  async delete(email: string): Promise<void> {
    try {
      await prisma.oTP.deleteMany({
        where: { email: email.toLowerCase() }
      });
      console.log('🗑️ OTP deleted for:', email);
    } catch (error) {
      console.error('❌ Error deleting OTP:', error);
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
          createdAt: {
            gte: oneMinuteAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
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
          createdAt: {
            gte: fiveMinutesAgo
          }
        }
      });

      if (otpCount >= 3) {
        return {
          allowed: false,
          message: 'Maximum OTP requests reached. Please try again after 5 minutes.',
          retryAfter: 300 // 5 minutes
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('❌ Error checking rate limit:', error);
      // Allow the request if there's an error checking rate limit
      return { allowed: true };
    }
  }
};

// Cleanup expired OTPs periodically (every 5 minutes)
setInterval(async () => {
  try {
    const result = await prisma.oTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} expired OTP(s)`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up expired OTPs:', error);
  }
}, 5 * 60 * 1000); // Every 5 minutes
