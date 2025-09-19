import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

async function resolveBenefitsMigration() {
  console.log('🔧 Resolving failed benefits migration...');

  try {
    // Get the database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('📋 Using database URL:', databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

    // Check if the benefits column already exists
    console.log('📋 Checking if benefits column already exists...');
    const { stdout: checkResult } = await execAsync(`
      psql "${databaseUrl}" -c "
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'benefits';
      "
    `);

    const columnExists = checkResult.trim().length > 0 && !checkResult.includes('(0 rows)');

    if (columnExists) {
      console.log('✅ Benefits column already exists in database');
      
      // Mark the failed migration as completed
      console.log('📝 Marking failed migration as completed...');
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
            'dummy-checksum-for-resolved-migration',
            NOW(),
            '20250919000000_add_benefits_field',
            'Migration resolved - column already existed',
            NULL,
            NOW(),
            1
          )
          ON CONFLICT (id) DO UPDATE SET
            finished_at = NOW(),
            logs = 'Migration resolved - column already existed';
        "
      `);
      
      console.log('✅ Migration marked as completed');
    } else {
      console.log('⚠️  Benefits column does not exist, applying migration manually...');
      
      // Apply the migration manually
      await execAsync(`
        psql "${databaseUrl}" -c "
          ALTER TABLE \"products\" ADD COLUMN \"benefits\" JSON NULL;
          COMMENT ON COLUMN \"products\".\"benefits\" IS 'JSON field storing mushroom benefits data';
        "
      `);
      
      console.log('✅ Benefits column added successfully');
      
      // Mark the migration as completed
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
            'dummy-checksum-for-manually-applied-migration',
            NOW(),
            '20250919000000_add_benefits_field',
            'Migration applied manually',
            NULL,
            NOW(),
            1
          )
          ON CONFLICT (id) DO UPDATE SET
            finished_at = NOW(),
            logs = 'Migration applied manually';
        "
      `);
      
      console.log('✅ Migration marked as completed');
    }

    console.log('🎉 Benefits migration resolved successfully!');
    console.log('');
    console.log('You can now run the build command again:');
    console.log('npm run build');

  } catch (error) {
    console.error('❌ Error resolving migration:', error.message);
    console.error('');
    console.log('💡 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running: brew services start postgresql');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Make sure the database exists: createdb mushmush_db');
    console.log('4. Verify database connection: psql "$DATABASE_URL" -c "SELECT 1"');
    process.exit(1);
  }
}

// Run the resolution
resolveBenefitsMigration();
