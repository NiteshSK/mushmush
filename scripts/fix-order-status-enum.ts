import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOrderStatusEnum() {
  console.log('🔧 Fixing OrderStatus enum...\n');

  try {
    // Execute raw SQL to add missing enum values
    const addConfirmed = `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_enum 
              WHERE enumlabel = 'CONFIRMED' 
              AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
          ) THEN
              ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';
              RAISE NOTICE 'Added CONFIRMED to OrderStatus enum';
          END IF;
      END $$;
    `;

    const addCompleted = `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_enum 
              WHERE enumlabel = 'COMPLETED' 
              AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
          ) THEN
              ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
              RAISE NOTICE 'Added COMPLETED to OrderStatus enum';
          END IF;
      END $$;
    `;

    console.log('Adding CONFIRMED to OrderStatus enum...');
    await prisma.$executeRawUnsafe(addConfirmed);
    
    console.log('Adding COMPLETED to OrderStatus enum...');
    await prisma.$executeRawUnsafe(addCompleted);

    // Verify enum values
    console.log('\n✅ Verifying OrderStatus enum values:');
    const enumValues: any[] = await prisma.$queryRaw`
      SELECT enumlabel as "value"
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
      ORDER BY enumsortorder;
    `;

    console.log('\nCurrent OrderStatus values:');
    enumValues.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.value}`);
    });

    console.log('\n✅ OrderStatus enum fixed successfully!');
    console.log('\nExpected values:');
    console.log('  - PENDING');
    console.log('  - CONFIRMED');
    console.log('  - PROCESSING');
    console.log('  - SHIPPED');
    console.log('  - DELIVERED');
    console.log('  - CANCELLED');
    console.log('  - COMPLETED');

  } catch (error) {
    console.error('❌ Error fixing OrderStatus enum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixOrderStatusEnum()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
