# Safe Production Deployment Guide - PostgreSQL Endpoint Change

## 🛡️ Zero Data Loss Migration Process

When changing your PostgreSQL endpoint in production, follow this process to ensure complete data safety.

## Pre-Migration Checklist

### 1. Environment Preparation
- [ ] New PostgreSQL endpoint is ready and accessible
- [ ] Database credentials are configured
- [ ] Backup storage is available

### 2. Safety Measures
- [ ] Current database is backed up
- [ ] Migration scripts are tested
- [ ] Rollback plan is prepared

## Step-by-Step Process

### Step 1: Create Automatic Backup
```bash
# This creates a timestamped backup before any changes
npm run db:backup
```

### Step 2: Update Environment Variables
Update your `.env` file with the new PostgreSQL endpoint:
```env
# Old endpoint (backup reference)
# DATABASE_URL="postgresql://old_endpoint"

# New endpoint
DATABASE_URL="postgresql://new_endpoint"
DIRECT_URL="postgresql://new_endpoint"  # If using connection pooling
```

### Step 3: Run Safe Production Migration
```bash
# This handles the entire migration process safely
npm run migrate:production
```

**What this does:**
1. ✅ Creates pre-migration backup
2. ✅ Checks current migration status
3. ✅ Resolves any pending migration issues (P3009 fix)
4. ✅ Deploys migrations to new endpoint
5. ✅ Tests build to ensure compatibility
6. ✅ Cleans up old backups

### Step 4: Verify Deployment
```bash
# Check migration status
npm run migrate:status

# Test the application
npm run build
npm start
```

## Alternative: Manual Process

If you prefer manual control:

```bash
# 1. Backup current database
npm run db:backup

# 2. Update .env with new endpoint

# 3. Fix any pending migration issues
npm run fix:production-migration

# 4. Deploy migrations
npx prisma migrate deploy

# 5. Test build
npm run build
```

## Data Recovery

If anything goes wrong, restore from backup:

```bash
# List available backups
npm run db:list

# Restore from specific backup
npm run db:restore
```

## Migration Safety Features

### Automatic Backups
- Timestamped backups before every migration
- Retention of 10 most recent backups
- Easy restore process

### Conflict Resolution
- Handles P3009 migration conflicts automatically
- Resolves failed migrations safely
- Preserves existing data

### Validation
- Pre-migration status checks
- Post-migration build tests
- Rollback capability

## Troubleshooting

### P3009 Error (Failed Migration)
```bash
npm run fix:production-migration
```

### Connection Issues
1. Verify new endpoint connectivity
2. Check firewall/security group settings
3. Validate credentials

### Schema Conflicts
The migration scripts handle:
- Existing enums (DiscountType)
- Duplicate tables
- Constraint conflicts

## Production Deployment Commands

### Quick Deploy (Recommended)
```bash
npm run migrate:production
```

### Emergency Rollback
```bash
npm run db:restore
```

### Status Check
```bash
npm run migrate:status
```

## Best Practices

1. **Always backup before changes**
2. **Test in staging first**
3. **Use the automated scripts**
4. **Monitor after deployment**
5. **Keep backups accessible**

## Support Files

- `scripts/safe-production-migration.ts` - Main migration script
- `scripts/resolve-production-migration.js` - P3009 fix
- `scripts/backup-database.ts` - Backup system
- `PRODUCTION_MIGRATION_FIX.md` - Specific P3009 resolution

Your data is protected throughout this entire process. The scripts are designed to fail safely and preserve your existing data.
