/**
 * Create OTP table in database
 * Run with: npm run create:otp-table
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createOTPTable() {
  try {
    console.log('🔧 Creating OTP table...\n');

    // Create the OTP table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "otps" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL,
        "otp" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ OTP table created');

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "otps_email_idx" ON "otps"("email");
    `);
    console.log('✅ Email index created');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "otps_expiresAt_idx" ON "otps"("expiresAt");
    `);
    console.log('✅ ExpiresAt index created');

    // Verify table exists
    const result = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'otps';
    `);

    console.log('\n📊 Verification:', result);
    console.log('\n✅ OTP table setup complete!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Restart your dev server: npm run dev');
    console.log('   2. Test OTP functionality in checkout');

  } catch (error) {
    console.error('❌ Error creating OTP table:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createOTPTable();
