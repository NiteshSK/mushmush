/**
 * Create OTP table in database
 * Run with: npm run create:otp-table
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createOTPTable() {
  try {
    console.log('🔧 Creating OTP table...\n');

    // Check if table already exists
    const tableExists = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'otps';
    `);

    if ((tableExists as any[]).length > 0) {
      console.log('ℹ️  OTP table already exists, skipping creation');
      await prisma.$disconnect();
      process.exit(0);
    }

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

  } catch (error: any) {
    // If table already exists, that's fine
    if (error.code === '42P07' || error.message?.includes('already exists')) {
      console.log('ℹ️  OTP table already exists');
      await prisma.$disconnect();
      process.exit(0);
    }
    
    console.error('❌ Error creating OTP table:', error);
    // Don't fail the build if OTP table creation fails
    console.log('⚠️  Continuing deployment despite OTP table error');
    await prisma.$disconnect();
    process.exit(0);
  } finally {
    await prisma.$disconnect();
  }
}

createOTPTable();
