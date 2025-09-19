import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function fixMigrationConflict() {
  try {
    console.log('🔍 Checking migration conflict...');

    // Check if instructorId column exists in training_schedules table
    console.log('Checking training_schedules table structure...');
    const columnCheck = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'training_schedules' 
      AND column_name = 'instructorid'
    `;

    console.log('Column check result:', columnCheck);

    if (columnCheck && Array.isArray(columnCheck) && columnCheck.length > 0) {
      console.log('✅ instructorId column already exists in database');
      
      // Check the migration table to see what's recorded
      console.log('Checking _prisma_migrations table...');
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        WHERE migration_name LIKE '%instructorid%'
        ORDER BY finished_at DESC
      `;
      
      console.log('Migration records:', migrations);

      // Check if the problematic migration file exists
      const migrationPath = '/Users/kataria/projects/mushmush-website/prisma/migrations/20250917163000_add_instructorid_to_training_schedules';
      const migrationFile = join(migrationPath, 'migration.sql');
      
      if (existsSync(migrationFile)) {
        console.log('Found problematic migration file:', migrationFile);
        
        // Read the migration file content
        const migrationContent = readFileSync(migrationFile, 'utf8');
        console.log('Migration file content:');
        console.log(migrationContent);
        
        // Since the column already exists, we can mark this migration as completed
        console.log('🔧 Marking problematic migration as completed...');
        
        try {
          // Insert the migration record if it doesn't exist
          await prisma.$executeRaw`
            INSERT INTO _prisma_migrations (
              id,
              checksum,
              finished_at,
              migration_name,
              logs,
              rolled_back_at,
              started_at,
              applied_steps_count
            ) VALUES (
              '20250917163000_add_instructorid_to_training_schedules',
              'dummy_checksum_for_existing_column',
              NOW(),
              '20250917163000_add_instructorid_to_training_schedules',
              '',
              NULL,
              NOW(),
              1
            ) ON CONFLICT (migration_name) DO NOTHING
          `;
          
          console.log('✅ Migration marked as completed');
          
        } catch (insertError) {
          console.log('Migration record already exists or other error:', insertError);
        }
      } else {
        console.log('❌ Migration file not found:', migrationFile);
      }
    } else {
      console.log('❌ instructorId column does not exist - different issue');
    }

    // Now try to create the benefits migration
    console.log('🚀 Attempting to create benefits migration...');
    
    const output = execSync('npx prisma migrate dev --name add_benefits_field', {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: '/Users/kataria/projects/mushmush-website'
    });
    
    console.log('✅ Benefits migration created successfully!');
    console.log('Output:', output);

  } catch (error) {
    console.error('❌ Error fixing migration conflict:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    if (typeof error === 'object' && error !== null && 'stdout' in error) {
      console.error('Stdout:', (error as any).stdout?.toString());
    }
    if (typeof error === 'object' && error !== null && 'stderr' in error) {
      console.error('Stderr:', (error as any).stderr?.toString());
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrationConflict();
