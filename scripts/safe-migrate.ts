import { exec } from 'child_process';
import { promisify } from 'util';
import { backupDatabase, restoreDatabase } from './backup-database';
import readline from 'readline';

const execAsync = promisify(exec);

interface MigrationSafetyConfig {
  autoBackup: boolean;
  confirmBeforeMigration: boolean;
  maxBackupsToKeep: number;
}

const defaultConfig: MigrationSafetyConfig = {
  autoBackup: true,
  confirmBeforeMigration: true,
  maxBackupsToKeep: 10
};

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function askQuestion(question: string): Promise<string> {
  const rl = createReadlineInterface();
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function checkMigrationStatus(): Promise<{ needsMigration: boolean; pendingMigrations: string[] }> {
  try {
    const { stdout } = await execAsync('npx prisma migrate status');
    
    if (stdout.includes('Database schema is up to date')) {
      return { needsMigration: false, pendingMigrations: [] };
    }
    
    // Parse pending migrations from output
    const lines = stdout.split('\n');
    const pendingMigrations: string[] = [];
    let inPendingSection = false;
    
    for (const line of lines) {
      if (line.includes('Following migration(s) have not yet been applied:')) {
        inPendingSection = true;
        continue;
      }
      
      if (inPendingSection && line.trim().startsWith('└─')) {
        const migrationName = line.trim().replace('└─ ', '').replace('/', '');
        pendingMigrations.push(migrationName);
      }
    }
    
    return { needsMigration: true, pendingMigrations };
    
  } catch (error) {
    console.error('❌ Failed to check migration status:', error);
    throw error;
  }
}

async function safeMigrate(migrationName?: string, config: MigrationSafetyConfig = defaultConfig): Promise<void> {
  try {
    console.log('🔍 Checking migration status...');
    
    const { needsMigration, pendingMigrations } = await checkMigrationStatus();
    
    if (!needsMigration && !migrationName) {
      console.log('✅ Database is already up to date. No migrations needed.');
      return;
    }
    
    if (needsMigration) {
      console.log('⚠️  Pending migrations found:');
      pendingMigrations.forEach(migration => console.log(`   - ${migration}`));
    }
    
    if (migrationName) {
      console.log(`🆕 Creating new migration: ${migrationName}`);
    }
    
    // Create backup if enabled
    let backupFile: string | null = null;
    if (config.autoBackup) {
      console.log('\n📦 Creating database backup before migration...');
      backupFile = await backupDatabase();
    }
    
    // Ask for confirmation if enabled
    if (config.confirmBeforeMigration) {
      console.log('\n⚠️  MIGRATION SAFETY CHECK');
      console.log('This operation will modify your database schema.');
      if (backupFile) {
        console.log(`✅ Backup created: ${backupFile}`);
      }
      
      const answer = await askQuestion('\nDo you want to proceed with the migration? (y/N): ');
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Migration cancelled by user.');
        return;
      }
    }
    
    // Run migration
    console.log('\n🚀 Running migration...');
    
    try {
      if (migrationName) {
        // Create new migration
        await execAsync(`npx prisma migrate dev --name "${migrationName}"`);
      } else {
        // Apply pending migrations
        await execAsync('npx prisma migrate deploy');
      }
      
      console.log('✅ Migration completed successfully!');
      
      // Generate Prisma client
      console.log('🔄 Regenerating Prisma client...');
      await execAsync('npx prisma generate');
      console.log('✅ Prisma client regenerated.');
      
    } catch (migrationError) {
      console.error('❌ Migration failed:', migrationError);
      
      if (backupFile && config.autoBackup) {
        console.log('\n🔄 Attempting to restore from backup...');
        try {
          await restoreDatabase(backupFile);
          console.log('✅ Database restored from backup.');
        } catch (restoreError) {
          console.error('❌ Failed to restore from backup:', restoreError);
          console.log('⚠️  Manual intervention required!');
        }
      }
      
      throw migrationError;
    }
    
  } catch (error) {
    console.error('❌ Safe migration failed:', error);
    throw error;
  }
}

async function resetWithBackup(): Promise<void> {
  try {
    console.log('⚠️  DATABASE RESET WARNING');
    console.log('This will completely drop and recreate your database!');
    console.log('ALL DATA WILL BE LOST unless restored from backup.');
    
    const confirmReset = await askQuestion('\nAre you ABSOLUTELY SURE you want to reset the database? (type "RESET" to confirm): ');
    
    if (confirmReset !== 'RESET') {
      console.log('❌ Database reset cancelled.');
      return;
    }
    
    // Create backup
    console.log('\n📦 Creating backup before reset...');
    const backupFile = await backupDatabase();
    
    const confirmWithBackup = await askQuestion(`\n✅ Backup created: ${backupFile}\nProceed with reset? (y/N): `);
    
    if (confirmWithBackup.toLowerCase() !== 'y' && confirmWithBackup.toLowerCase() !== 'yes') {
      console.log('❌ Database reset cancelled.');
      return;
    }
    
    // Reset database
    console.log('\n🔄 Resetting database...');
    await execAsync('npx prisma migrate reset --force');
    
    console.log('✅ Database reset completed.');
    console.log(`💾 Backup available at: ${backupFile}`);
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const migrationName = process.argv[3];
  
  switch (command) {
    case 'migrate':
      safeMigrate(migrationName)
        .then(() => console.log('\n🎉 Migration process completed!'))
        .catch(error => {
          console.error('\n💥 Migration process failed:', error);
          process.exit(1);
        });
      break;
      
    case 'reset':
      resetWithBackup()
        .then(() => console.log('\n🎉 Reset process completed!'))
        .catch(error => {
          console.error('\n💥 Reset process failed:', error);
          process.exit(1);
        });
      break;
      
    case 'status':
      checkMigrationStatus()
        .then(({ needsMigration, pendingMigrations }) => {
          if (needsMigration) {
            console.log('⚠️  Pending migrations:');
            pendingMigrations.forEach(migration => console.log(`   - ${migration}`));
          } else {
            console.log('✅ Database is up to date.');
          }
        })
        .catch(error => {
          console.error('Failed to check status:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Safe Migration Tool');
      console.log('');
      console.log('Usage:');
      console.log('  npm run migrate:safe [migration-name]  - Safely run migration with backup');
      console.log('  npm run migrate:reset                  - Reset database with backup');
      console.log('  npm run migrate:status                 - Check migration status');
      console.log('');
      console.log('Features:');
      console.log('  ✅ Automatic database backup before migrations');
      console.log('  ✅ Confirmation prompts for safety');
      console.log('  ✅ Automatic rollback on migration failure');
      console.log('  ✅ Migration status checking');
      break;
  }
}
