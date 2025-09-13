# Database Migration Safety Guide

## Why Data Was Lost

The data loss occurred because we used `prisma migrate reset --force` which:
- **Drops the entire database**
- **Recreates all tables from scratch** 
- **Loses ALL existing data**

This happened because there were schema conflicts that required a full reset.

## Prevention Measures Implemented

### 1. Automatic Backup System

**New Commands Available:**
```bash
# Create database backup
npm run db:backup

# List available backups  
npm run db:list

# Restore from specific backup
npm run db:restore <backup-file>

# Clean old backups (keep 10 most recent)
npm run db:clean
```

### 2. Safe Migration Tool

**New Safe Migration Commands:**
```bash
# Safe migration with automatic backup
npm run migrate:safe [migration-name]

# Safe database reset with backup
npm run migrate:reset

# Check migration status
npm run migrate:status
```

**Safety Features:**
- ✅ **Automatic backup** before any migration
- ✅ **Confirmation prompts** for destructive operations
- ✅ **Automatic rollback** if migration fails
- ✅ **Status checking** before migrations

### 3. Migration Best Practices

**NEVER use these commands in production:**
```bash
# ❌ DANGEROUS - Deletes all data
prisma migrate reset --force

# ❌ DANGEROUS - Can cause data loss
prisma db push --force-reset
```

**ALWAYS use these safe alternatives:**
```bash
# ✅ SAFE - Creates backup first
npm run migrate:safe

# ✅ SAFE - Backup + confirmation
npm run migrate:reset
```

## Recovery Process

### Restore Lost Data

1. **Check available backups:**
   ```bash
   npm run db:list
   ```

2. **Restore from backup:**
   ```bash
   npm run db:restore backups/backup-2025-09-13T13-16-15-123Z.sql
   ```

3. **Re-run promotional banner seed:**
   ```bash
   npx ts-node scripts/seed-promotional-banners.ts
   ```

## Future Migration Workflow

### For Schema Changes:

1. **Check current status:**
   ```bash
   npm run migrate:status
   ```

2. **Create safe migration:**
   ```bash
   npm run migrate:safe "add_new_feature"
   ```

3. **The tool will:**
   - Create automatic backup
   - Ask for confirmation
   - Run migration
   - Rollback if it fails

### For Database Reset (Emergency Only):

1. **Use safe reset:**
   ```bash
   npm run migrate:reset
   ```

2. **Confirms twice before proceeding**
3. **Creates backup automatically**
4. **Provides restore instructions**

## Backup Storage

- **Location:** `./backups/` directory
- **Format:** `backup-YYYY-MM-DDTHH-mm-ss-sssZ.sql`
- **Retention:** Keeps 10 most recent backups
- **Size:** Compressed SQL dumps

## Emergency Recovery

If you lose data and need to recover:

1. **Stop the application**
2. **List backups:** `npm run db:list`
3. **Restore latest:** `npm run db:restore <latest-backup>`
4. **Verify data integrity**
5. **Restart application**

## Key Takeaways

- **Always backup before migrations**
- **Use safe migration tools**
- **Never use `--force` flags in production**
- **Test migrations on development first**
- **Keep multiple backup copies**

The new safety system ensures this data loss will never happen again!
