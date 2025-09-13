import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface BackupConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password?: string;
}

async function parseConnectionString(): Promise<BackupConfig> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Parse PostgreSQL connection string
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port || '5432',
    database: url.pathname.slice(1), // Remove leading slash
    username: url.username,
    password: url.password
  };
}

async function createBackupDirectory(): Promise<string> {
  const backupDir = path.join(process.cwd(), 'backups');
  try {
    await fs.access(backupDir);
  } catch {
    await fs.mkdir(backupDir, { recursive: true });
  }
  return backupDir;
}

export async function backupDatabase(): Promise<string> {
  try {
    const config = await parseConnectionString();
    const backupDir = await createBackupDirectory();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

    console.log('🔄 Creating database backup...');
    console.log(`📁 Backup location: ${backupFile}`);

    // Set PGPASSWORD environment variable if password exists
    const env = { ...process.env };
    if (config.password) {
      env.PGPASSWORD = config.password;
    }

    // Create pg_dump command
    const dumpCommand = [
      'pg_dump',
      `-h ${config.host}`,
      `-p ${config.port}`,
      `-U ${config.username}`,
      `-d ${config.database}`,
      '--verbose',
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      `--file="${backupFile}"`
    ].join(' ');

    await execAsync(dumpCommand, { env });

    // Verify backup file was created and has content
    const stats = await fs.stat(backupFile);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }

    console.log(`✅ Database backup created successfully`);
    console.log(`📊 Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    return backupFile;

  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  }
}

export async function restoreDatabase(backupFile: string): Promise<void> {
  try {
    const config = await parseConnectionString();
    
    console.log('🔄 Restoring database from backup...');
    console.log(`📁 Backup file: ${backupFile}`);

    // Verify backup file exists
    await fs.access(backupFile);

    // Set PGPASSWORD environment variable if password exists
    const env = { ...process.env };
    if (config.password) {
      env.PGPASSWORD = config.password;
    }

    // Create psql restore command
    const restoreCommand = [
      'psql',
      `-h ${config.host}`,
      `-p ${config.port}`,
      `-U ${config.username}`,
      `-d ${config.database}`,
      `--file="${backupFile}"`
    ].join(' ');

    await execAsync(restoreCommand, { env });

    console.log('✅ Database restored successfully');

  } catch (error) {
    console.error('❌ Database restore failed:', error);
    throw error;
  }
}

export async function listBackups(): Promise<string[]> {
  try {
    const backupDir = await createBackupDirectory();
    const files = await fs.readdir(backupDir);
    
    return files
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .sort()
      .reverse(); // Most recent first
      
  } catch (error) {
    console.error('❌ Failed to list backups:', error);
    return [];
  }
}

export async function cleanOldBackups(keepCount: number = 10): Promise<void> {
  try {
    const backups = await listBackups();
    const backupDir = await createBackupDirectory();
    
    if (backups.length > keepCount) {
      const toDelete = backups.slice(keepCount);
      
      for (const backup of toDelete) {
        const filePath = path.join(backupDir, backup);
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted old backup: ${backup}`);
      }
      
      console.log(`✅ Cleaned ${toDelete.length} old backups, kept ${keepCount} most recent`);
    }
    
  } catch (error) {
    console.error('❌ Failed to clean old backups:', error);
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'backup':
      backupDatabase()
        .then(file => console.log(`Backup created: ${file}`))
        .catch(error => {
          console.error('Backup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('Please provide backup file path');
        process.exit(1);
      }
      restoreDatabase(backupFile)
        .then(() => console.log('Restore completed'))
        .catch(error => {
          console.error('Restore failed:', error);
          process.exit(1);
        });
      break;
      
    case 'list':
      listBackups()
        .then(backups => {
          console.log('Available backups:');
          backups.forEach(backup => console.log(`  ${backup}`));
        })
        .catch(error => {
          console.error('Failed to list backups:', error);
          process.exit(1);
        });
      break;
      
    case 'clean':
      const keepCount = parseInt(process.argv[3]) || 10;
      cleanOldBackups(keepCount)
        .then(() => console.log('Cleanup completed'))
        .catch(error => {
          console.error('Cleanup failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run db:backup           - Create a backup');
      console.log('  npm run db:restore <file>   - Restore from backup');
      console.log('  npm run db:list             - List available backups');
      console.log('  npm run db:clean [count]    - Clean old backups (keep 10 by default)');
      break;
  }
}
