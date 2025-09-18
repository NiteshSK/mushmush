import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Safety checks
function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.DATABASE_URL?.includes('production') ||
         process.env.DATABASE_URL?.includes('aws') ||
         process.env.DATABASE_URL?.includes('rds') ||
         process.env.DATABASE_URL?.includes('heroku');
}

function canRunInProduction(): boolean {
  // Allow only if explicitly confirmed via environment variable
  return process.env.ALLOW_PRODUCTION_RESTORE === 'true' && 
         process.env.PRODUCTION_RESTORE_CONFIRMATION === 'I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA';
}

async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `pre-nuclear-cleanup-backup-${timestamp}.sql`;
  const backupPath = path.join(process.cwd(), 'backups', backupFileName);
  
  try {
    console.log('🔄 Creating backup before nuclear cleanup...');
    
    // Ensure backups directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
      fs.mkdirSync(path.join(process.cwd(), 'backups'), { recursive: true });
    }
    
    // Try to get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Use pg_dump to create backup
    const command = `pg_dump "${databaseUrl}" > "${backupPath}"`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
}

async function main() {
  console.log('🧹 Nuclear cleanup - removing ALL data directly from database...');
  
  // Safety check 1: Environment check
  if (isProductionEnvironment()) {
    console.log('⚠️  WARNING: Production environment detected!');
    
    if (!canRunInProduction()) {
      console.log('❌ PRODUCTION SAFETY: Cannot run in production environment without explicit confirmation.');
      console.log('');
      console.log('To run in production, you must set these environment variables:');
      console.log('  ALLOW_PRODUCTION_RESTORE=true');
      console.log('  PRODUCTION_RESTORE_CONFIRMATION=I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA');
      console.log('');
      console.log('Example:');
      console.log('  ALLOW_PRODUCTION_RESTORE=true PRODUCTION_RESTORE_CONFIRMATION=I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA npx tsx scripts/nuclear-cleanup.ts');
      console.log('');
      console.log('❌ Nuclear cleanup aborted for safety.');
      return;
    }
    
    console.log('✅ Production nuclear cleanup confirmed via environment variables');
  }
  
  // Safety check 2: Create backup
  try {
    const backupPath = await createBackup();
    console.log(`✅ Backup successfully created at: ${backupPath}`);
  } catch (error) {
    console.log('❌ Backup creation failed. Aborting nuclear cleanup for safety.');
    console.log('   Error:', error.message);
    return;
  }
  
  console.log('✅ All safety checks passed. Proceeding with nuclear cleanup...');
  
  try {
    // Use raw SQL to ensure complete removal
    console.log('Dropping all foreign key constraints temporarily...')
    
    // Delete all data in correct order to avoid FK constraints
    await prisma.$executeRaw`TRUNCATE TABLE "order_items" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "orders" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "recently_viewed" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "wishlist_items" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "reviews" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "product_categories" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE;`
    
    console.log('✅ All tables truncated')

    // Verify complete removal
    const productCount = await prisma.product.count()
    const categoryCount = await prisma.category.count()
    const productCategoryCount = await prisma.productCategory.count()
    
    console.log(`📊 Final verification:`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Categories: ${categoryCount}`)
    console.log(`   Product-Category relations: ${productCategoryCount}`)
    
    if (productCount === 0 && categoryCount === 0 && productCategoryCount === 0) {
      console.log('🎉 Nuclear cleanup successful! All mushroom data eliminated.')
    } else {
      console.log('⚠️  Some data still remains after nuclear cleanup')
    }

  } catch (error) {
    console.error('❌ Error during nuclear cleanup:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
