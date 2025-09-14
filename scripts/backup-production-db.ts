import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const prisma = new PrismaClient();

async function backupProductionDatabase() {
  try {
    console.log('🔄 Starting production database backup...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `production-backup-${timestamp}.sql`);

    console.log(`📦 Creating backup: ${backupFile}`);

    // Try different pg_dump locations
    const pgDumpPaths = [
      '/opt/homebrew/opt/postgresql@17/bin/pg_dump',
      '/opt/homebrew/bin/pg_dump',
      '/usr/local/bin/pg_dump',
      '/usr/bin/pg_dump',
      'pg_dump' // fallback to PATH
    ];

    let backupSuccess = false;
    let lastError = '';

    for (const pgDumpPath of pgDumpPaths) {
      try {
        console.log(`🔍 Trying pg_dump at: ${pgDumpPath}`);
        
        const command = `${pgDumpPath} "${process.env.DATABASE_URL}" > "${backupFile}"`;
        await execAsync(command);
        
        // Check if backup file was created and has content
        if (fs.existsSync(backupFile) && fs.statSync(backupFile).size > 0) {
          console.log('✅ Backup created successfully');
          console.log(`📁 Backup file: ${backupFile}`);
          console.log(`📊 Backup size: ${fs.statSync(backupFile).size} bytes`);
          
          backupSuccess = true;
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.log(`❌ Failed with ${pgDumpPath}: ${lastError}`);
      }
    }

    if (!backupSuccess) {
      throw new Error(`All pg_dump attempts failed. Last error: ${lastError}`);
    }

    // Verify backup by checking if it contains expected table structures
    console.log('🔍 Verifying backup integrity...');
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    
    const expectedTables = ['categories', 'products', 'users', 'reviews'];
    const missingTables = expectedTables.filter(table => 
      !backupContent.includes(`CREATE TABLE ${table}`) && 
      !backupContent.includes(`CREATE TABLE public.${table}`)
    );

    if (missingTables.length > 0) {
      console.warn(`⚠️  Backup might be missing expected tables: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ Backup verification passed');
    }

    // Clean up old backups (keep only last 5)
    console.log('🧹 Cleaning up old backups...');
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('production-backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stats: fs.statSync(path.join(backupDir, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    if (files.length > 5) {
      const toDelete = files.slice(5);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }

    console.log('🎉 Production database backup completed successfully!');
    return backupFile;

  } catch (error) {
    console.error('❌ Backup failed:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backupProductionDatabase()
    .then((backupFile) => {
      console.log(`\n📋 Backup completed: ${backupFile}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Backup process failed:', error.message);
      process.exit(1);
    });
}

export { backupProductionDatabase };
