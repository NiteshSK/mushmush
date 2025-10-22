import { PrismaClient } from '@prisma/client';

// Use production database URL
const productionUrl = process.env.DATABASE_URL;

if (!productionUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

console.log('🚀 Fixing OrderStatus enum in PRODUCTION database...\n');
console.log('⚠️  WARNING: This will modify your PRODUCTION database!\n');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: productionUrl,
    },
  },
});

async function fixProductionOrderStatusEnum() {
  try {
    console.log('📡 Connecting to production database...\n');

    // Add CONFIRMED
    const addConfirmed = `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_enum 
              WHERE enumlabel = 'CONFIRMED' 
              AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
          ) THEN
              ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';
              RAISE NOTICE '✅ Added CONFIRMED to OrderStatus enum';
          ELSE
              RAISE NOTICE 'ℹ️  CONFIRMED already exists';
          END IF;
      END $$;
    `;

    // Add COMPLETED
    const addCompleted = `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_enum 
              WHERE enumlabel = 'COMPLETED' 
              AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
          ) THEN
              ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
              RAISE NOTICE '✅ Added COMPLETED to OrderStatus enum';
          ELSE
              RAISE NOTICE 'ℹ️  COMPLETED already exists';
          END IF;
      END $$;
    `;

    console.log('Adding CONFIRMED to OrderStatus enum...');
    await prisma.$executeRawUnsafe(addConfirmed);
    
    console.log('Adding COMPLETED to OrderStatus enum...');
    await prisma.$executeRawUnsafe(addCompleted);

    // Verify enum values
    console.log('\n✅ Verifying OrderStatus enum values in PRODUCTION:\n');
    const enumValues: any[] = await prisma.$queryRaw`
      SELECT enumlabel as "value", enumsortorder as "order"
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
      ORDER BY enumsortorder;
    `;

    console.log('Current OrderStatus values in PRODUCTION:');
    enumValues.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.value}`);
    });

    console.log('\n✅ Production OrderStatus enum fixed successfully!');
    console.log('\n🎉 Your checkout should now work in production!');

  } catch (error) {
    console.error('\n❌ Error fixing production OrderStatus enum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Confirm before running
const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
  console.log('⚠️  To run this script, use:');
  console.log('   npm run fix:production-order-status -- --confirm');
  console.log('\nOr:');
  console.log('   tsx scripts/fix-production-order-status.ts --confirm');
  process.exit(0);
}

fixProductionOrderStatusEnum()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
