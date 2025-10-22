import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('🔍 Checking production database schema...\n');

    // Check orders table columns
    const ordersColumns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Orders table columns:');
    console.table(ordersColumns);

    // Check if shippingAddress exists
    const shippingAddressCol = (ordersColumns as any[]).find(
      col => col.column_name === 'shippingAddress'
    );

    if (shippingAddressCol) {
      console.log('\n✅ shippingAddress column exists');
      console.log('   Type:', shippingAddressCol.data_type);
      console.log('   Nullable:', shippingAddressCol.is_nullable);
    } else {
      console.log('\n❌ shippingAddress column NOT found!');
      console.log('   This will cause null constraint violations');
    }

    // Check addresses table
    const addressesCount = await prisma.addresses.count();
    console.log('\n📍 Total addresses in database:', addressesCount);

    // Check for duplicate addresses
    const duplicates = await prisma.$queryRawUnsafe(`
      SELECT 
        "userId",
        street,
        city,
        COUNT(*) as count
      FROM addresses
      WHERE "userId" IS NOT NULL
      GROUP BY "userId", street, city
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10;
    `);

    console.log('\n🔄 Duplicate addresses:');
    console.table(duplicates);

    // Check OTP table
    try {
      const otpTableExists = await prisma.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'otps';
      `);

      if ((otpTableExists as any[]).length > 0) {
        console.log('\n✅ OTP table exists');
      } else {
        console.log('\n❌ OTP table does NOT exist');
      }
    } catch (e) {
      console.log('\n❌ OTP table does NOT exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
