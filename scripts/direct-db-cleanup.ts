import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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
  const backupFileName = `pre-direct-cleanup-backup-${timestamp}.sql`;
  const backupPath = path.join(process.cwd(), 'backups', backupFileName);
  
  try {
    console.log('🔄 Creating backup before direct database cleanup...');
    
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

// Create a fresh Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🔥 Direct database cleanup - bypassing all caches...');
  
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
      console.log('  ALLOW_PRODUCTION_RESTORE=true PRODUCTION_RESTORE_CONFIRMATION=I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA npx tsx scripts/direct-db-cleanup.ts');
      console.log('');
      console.log('❌ Direct database cleanup aborted for safety.');
      return;
    }
    
    console.log('✅ Production direct database cleanup confirmed via environment variables');
  }
  
  // Safety check 2: Create backup
  try {
    const backupPath = await createBackup();
    console.log(`✅ Backup successfully created at: ${backupPath}`);
  } catch (error) {
    console.log('❌ Backup creation failed. Aborting direct database cleanup for safety.');
    console.log('   Error:', error.message);
    return;
  }
  
  console.log('✅ All safety checks passed. Proceeding with direct database cleanup...');
  
  try {
    // Connect explicitly
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Use raw SQL to directly delete from the database
    console.log('🗑️  Executing direct SQL deletions...')
    
    // Delete in proper order to handle foreign keys
    await prisma.$executeRaw`DELETE FROM "order_items"`
    await prisma.$executeRaw`DELETE FROM "orders"`
    await prisma.$executeRaw`DELETE FROM "recently_viewed"`
    await prisma.$executeRaw`DELETE FROM "wishlist_items"`
    await prisma.$executeRaw`DELETE FROM "reviews"`
    await prisma.$executeRaw`DELETE FROM "product_categories"`
    await prisma.$executeRaw`DELETE FROM "products"`
    await prisma.$executeRaw`DELETE FROM "categories"`
    
    // Reset auto-increment sequences
    await prisma.$executeRaw`ALTER SEQUENCE IF EXISTS "products_id_seq" RESTART WITH 1`
    await prisma.$executeRaw`ALTER SEQUENCE IF EXISTS "categories_id_seq" RESTART WITH 1`
    
    console.log('✅ Direct SQL deletions completed')

    // Verify with fresh queries
    const productCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "products"`
    const categoryCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "categories"`
    
    console.log('📊 Direct count verification:')
    console.log('Products:', productCount)
    console.log('Categories:', categoryCount)

    // Also verify with Prisma client
    const prismaProductCount = await prisma.product.count()
    const prismaCategoryCount = await prisma.category.count()
    
    console.log('📊 Prisma client verification:')
    console.log(`Products: ${prismaProductCount}`)
    console.log(`Categories: ${prismaCategoryCount}`)

    if (prismaProductCount === 0 && prismaCategoryCount === 0) {
      console.log('🎉 SUCCESS: Database is now completely clean!')
    } else {
      console.log('⚠️  Data still exists - investigating further...')
    }

  } catch (error) {
    console.error('❌ Error during direct cleanup:', error)
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
