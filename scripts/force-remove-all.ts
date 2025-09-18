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
  const backupFileName = `pre-force-remove-backup-${timestamp}.sql`;
  const backupPath = path.join(process.cwd(), 'backups', backupFileName);
  
  try {
    console.log('🔄 Creating backup before force removal...');
    
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
  console.log('🗑️  Force removing ALL data...');
  
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
      console.log('  ALLOW_PRODUCTION_RESTORE=true PRODUCTION_RESTORE_CONFIRMATION=I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA npx tsx scripts/force-remove-all.ts');
      console.log('');
      console.log('❌ Force removal aborted for safety.');
      return;
    }
    
    console.log('✅ Production force removal confirmed via environment variables');
  }
  
  // Safety check 2: Create backup
  try {
    const backupPath = await createBackup();
    console.log(`✅ Backup successfully created at: ${backupPath}`);
  } catch (error) {
    console.log('❌ Backup creation failed. Aborting force removal for safety.');
    console.log('   Error:', error.message);
    return;
  }
  
  console.log('✅ All safety checks passed. Proceeding with force removal...');
  
  try {
    // Delete in proper order to avoid foreign key constraints
    console.log('Removing order items...')
    await prisma.orderItem.deleteMany({})
    
    console.log('Removing orders...')
    await prisma.order.deleteMany({})
    
    console.log('Removing recently viewed...')
    await prisma.recentlyViewed.deleteMany({})
    
    console.log('Removing wishlist items...')
    await prisma.wishlistItem.deleteMany({})
    
    console.log('Removing reviews...')
    await prisma.review.deleteMany({})
    
    console.log('Removing product-category relationships...')
    await prisma.productCategory.deleteMany({})
    
    console.log('Removing products...')
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Removed ${deletedProducts.count} products`)
    
    console.log('Removing categories...')
    const deletedCategories = await prisma.category.deleteMany({})
    console.log(`✅ Removed ${deletedCategories.count} categories`)

    // Verify removal
    const remainingProducts = await prisma.product.count()
    const remainingCategories = await prisma.category.count()
    
    console.log(`📊 Verification:`)
    console.log(`   Products remaining: ${remainingProducts}`)
    console.log(`   Categories remaining: ${remainingCategories}`)
    
    if (remainingProducts === 0 && remainingCategories === 0) {
      console.log('🎉 All data successfully removed!')
    } else {
      console.log('⚠️  Some data still remains')
    }

  } catch (error) {
    console.error('❌ Error during removal:', error)
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
