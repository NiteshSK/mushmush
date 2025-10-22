-- Create OTP table for storing one-time passwords
CREATE TABLE IF NOT EXISTS "otps" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "otp" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS "otps_email_idx" ON "otps"("email");
CREATE INDEX IF NOT EXISTS "otps_expiresAt_idx" ON "otps"("expiresAt");

-- Verify table was created
SELECT 'OTP table created successfully!' as message;
