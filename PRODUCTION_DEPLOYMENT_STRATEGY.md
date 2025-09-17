# Production Deployment Strategy

## 🚨 IMPORTANT: Database Safety First

This deployment strategy prioritizes data safety and ensures no production data is lost during the migration process.

## 📋 Pre-Deployment Checklist

### 1. Database Backup (MANDATORY)
```bash
# Run this before any deployment
npm run backup:production
```

### 2. Verify Backup
```bash
# Check that backup was created successfully
ls -la backups/
```

### 3. Test Local Build
```bash
# Ensure local build passes
npm run build
```

## 🔄 Deployment Steps

### Step 1: Backup Production Database
```bash
# Execute the backup script
npx tsx scripts/backup-production-db.ts
```

### Step 2: Switch to Production Database
```bash
# Update .env with production DATABASE_URL
# Example:
DATABASE_URL="postgresql://username:password@production-host:5432/production_db"
DIRECT_URL="postgresql://username:password@production-host:5432/production_db"
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Check Pending Migrations
```bash
# This will show what migrations need to be applied
npx prisma migrate status
```

### Step 5: Apply Migrations (SAFE MODE)
```bash
# This applies migrations without resetting data
npx prisma migrate deploy
```

### Step 6: Seed New Data (Optional)
```bash
# Only if you need to add instructors or training data
npx prisma db seed
```

### Step 7: Build and Deploy
```bash
npm run build
# Then deploy to your hosting platform (Vercel, etc.)
```

## 🛡️ Safety Measures

### 1. Migration Safety
- All migrations are **additive only** - no data deletion
- New tables: `instructors`, `training_programs`, `training_schedules`, `training_registrations`
- Modified tables: `users` (no data loss), `training_schedule` (column rename with data preservation)

### 2. Data Preservation
- Existing user data: ✅ Preserved
- Existing products: ✅ Preserved  
- Existing orders: ✅ Preserved
- Existing categories: ✅ Preserved
- Existing blog posts: ✅ Preserved

### 3. Rollback Plan
If anything goes wrong:
```bash
# Restore from backup
psql -d production_db -f backups/production-backup-[timestamp].sql
```

## 📊 New Features Being Deployed

### 1. Instructor Management
- New `instructors` table
- Relational integrity with training schedules
- Admin interface for instructor management

### 2. Training Programs
- New `training_programs` table
- Course catalog with pricing and duration
- Public training programs page

### 3. Training Schedules
- Enhanced `training_schedules` table
- Instructor assignment via foreign key
- Admin interface for schedule management

### 4. Training Registrations
- New `training_registrations` table
- User registration system
- Payment integration ready

### 5. Wishlist Error Fix
- Graceful handling of unauthorized users
- Improved user experience

## 🔍 Post-Deployment Verification

### 1. Check Database Integrity
```bash
# Verify all tables exist
psql -d production_db -c "\dt"
```

### 2. Test Key Features
- [ ] User login works
- [ ] Product browsing works
- [ ] Wishlist functions (logged in users)
- [ ] Training programs page loads
- [ ] Admin panel accessible
- [ ] Instructor management works

### 3. Monitor Logs
```bash
# Check for any errors in production logs
# (Platform-specific commands)
```

## 🚨 Emergency Procedures

### If Build Fails
1. Check error messages
2. Fix type errors locally
3. Test build again
4. Re-deploy

### If Migration Fails
1. **STOP** immediately
2. Check migration error logs
3. Restore from backup if necessary
4. Fix migration issues
5. Re-attempt deployment

### If Data Issues Occur
1. **STOP** all user operations
2. Restore from latest backup
3. Investigate root cause
4. Fix issues
5. Re-deploy with fixes

## 📞 Support

If you encounter any issues during deployment:
1. Check this document first
2. Review error messages carefully
3. Restore from backup if needed
4. Contact development support if issues persist

---

## ⚡ Quick Deployment Commands

```bash
# 1. Backup (MANDATORY)
npm run backup:production

# 2. Switch to production DB
# Edit .env file with production DATABASE_URL

# 3. Deploy
npx prisma generate && npx prisma migrate deploy && npm run build

# 4. Deploy to platform
# (Platform-specific deploy command)
```

---

**REMEMBER**: Always backup before deploying to production! 🛡️
