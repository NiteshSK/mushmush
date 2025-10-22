import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrdersSchema() {
  try {
    console.log('🔍 Checking orders table schema...\n');

    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Orders table columns:');
    console.table(result);

    // Check specifically for shippingAddress
    const shippingAddressCol = (result as any[]).find(
      col => col.column_name === 'shippingAddress'
    );

    if (shippingAddressCol) {
      console.log('\n⚠️  Found shippingAddress column:');
      console.log('   Type:', shippingAddressCol.data_type);
      console.log('   Nullable:', shippingAddressCol.is_nullable);
    } else {
      console.log('\n✅ No shippingAddress column found (correct)');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrdersSchema();
