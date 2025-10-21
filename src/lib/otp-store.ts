// OTP Store - Shared storage for OTP verification
// In production, use Redis or database instead of in-memory storage

interface OTPData {
  otp: string;
  expiresAt: number;
}

// Store OTPs temporarily (in production, use Redis or database)
export const otpStore = new Map<string, OTPData>();

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(otpStore.entries());
  for (const [email, data] of entries) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
      console.log('🧹 Cleaned up expired OTP for:', email);
    }
  }
}, 60000); // Clean up every minute
