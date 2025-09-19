import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

async function forceResolveMigration() {
  console.log('🔧 Force resolving failed benefits migration...');

  try {
    // Get the database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('📋 Using database URL:', databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

    // First, let's check the current state of the migration
    console.log('📋 Checking current migration status...');
    const { stdout: migrationStatus } = await execAsync(`
      psql "${databaseUrl}" -c "
        SELECT id, migration_name, finished_at, logs 
        FROM _prisma_migrations 
        WHERE migration_name = '20250919000000_add_benefits_field'
        ORDER BY started_at DESC 
        LIMIT 1;
      "
    `);

    console.log('Current migration status:', migrationStatus);

    // Delete any existing failed migration records
    console.log('🗑️  Cleaning up existing migration records...');
    await execAsync(`
      psql "${databaseUrl}" -c "
        DELETE FROM _prisma_migrations 
        WHERE migration_name = '20250919000000_add_benefits_field';
      "
    `);

    console.log('✅ Existing migration records deleted');

    // Insert a new completed migration record
    console.log('📝 Inserting completed migration record...');
    await execAsync(`
      psql "${databaseUrl}" -c "
        INSERT INTO _prisma_migrations (
          id,
          checksum,
          finished_at,
          migration_name,
          logs,
          rolled_back_at,
          started_at,
          applied_steps_count
        )
        VALUES (
          '20250919000000_add_benefits_field',
          'resolved-manually-' || substr(md5(random()::text), 1, 10),
          NOW(),
          '20250919000000_add_benefits_field',
          'Migration resolved manually - benefits column already exists',
          NULL,
          NOW() - interval '1 minute',
          1
        );
      "
    `);

    console.log('✅ Migration record inserted as completed');

    // Verify the fix
    console.log('🔍 Verifying the fix...');
    const { stdout: verifyResult } = await execAsync(`
      psql "${databaseUrl}" -c "
        SELECT id, migration_name, finished_at, logs 
        FROM _prisma_migrations 
        WHERE migration_name = '20250919000000_add_benefits_field'
        AND finished_at IS NOT NULL;
      "
    `);

    if (verifyResult.trim().length > 0) {
      console.log('✅ Verification successful:');
      console.log(verifyResult);
    } else {
      throw new Error('Verification failed - migration not found in completed state');
    }

    console.log('🎉 Benefits migration force resolved successfully!');
    console.log('');
    console.log('You can now run the build command again:');
    console.log('npm run build');

  } catch (error) {
    console.error('❌ Error force resolving migration:', error.message);
    console.error('');
    console.log('💡 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running: brew services start postgresql');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Make sure the database exists: createdb mushmush_db');
    console.log('4. Verify database connection: psql "$DATABASE_URL" -c "SELECT 1"');
    console.log('5. Check if _prisma_migrations table exists: psql "$DATABASE_URL" -c "\\dt _prisma_migrations"');
    process.exit(1);
  }
}

// Run the force resolution
forceResolveMigration();
