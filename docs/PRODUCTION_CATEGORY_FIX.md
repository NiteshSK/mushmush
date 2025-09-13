# Production Category Path Fix Deployment Guide

## Issue Summary
The shop by category pages were returning 404 errors because the database category paths were pointing to `/shop-without-sidebar` instead of the correct `/shop` route.

## Files Modified

### 1. Database Seed (`prisma/seed.ts`)
- Updated all category paths from `/shop-without-sidebar` to `/shop`
- Changes:
  - `all-mushrooms`: `/shop-without-sidebar` → `/shop`
  - `edible`: `/shop-without-sidebar?category=edible` → `/shop?category=edible`
  - `medicinal`: `/shop-without-sidebar?category=medicinal` → `/shop?category=medicinal`
  - `tinctures`: `/shop-without-sidebar?category=tinctures` → `/shop?category=tinctures`
  - `powders`: `/shop-without-sidebar?category=powders` → `/shop?category=powders`

### 2. Production Migration (`prisma/migrations/20250913172210_fix_category_paths/migration.sql`)
- Created safe SQL migration to update existing category paths
- Uses direct UPDATE statements for specific category slugs
- Includes logging for verification

### 3. Production Scripts
- `scripts/fix-production-category-paths.ts`: TypeScript script for manual fixes
- `scripts/deploy-category-fixes.sh`: Comprehensive deployment script

## Deployment Options

### Option 1: Automated Deployment (Recommended)
```bash
# Run the comprehensive deployment script
./scripts/deploy-category-fixes.sh
```

This script will:
1. Create a database backup
2. Build the application
3. Run the category path fix script
4. Verify the changes
5. Deploy to production (if Vercel CLI is available)

### Option 2: Manual Migration Deployment
```bash
# 1. Create database backup
npm run db:backup

# 2. Run the migration
npx prisma migrate deploy

# 3. Verify the changes
curl -s https://your-domain.com/api/categories | jq '.[] | {title, path}'

# 4. Deploy the code changes
npm run build
vercel --prod  # or your deployment method
```

### Option 3: Manual Script Execution
```bash
# 1. Create database backup
npm run db:backup

# 2. Run the fix script directly
npx ts-node scripts/fix-production-category-paths.ts

# 3. Deploy the updated code
npm run build
vercel --prod  # or your deployment method
```

## Verification Steps

After deployment, verify the fixes:

### 1. Check Category API
```bash
curl -s https://your-domain.com/api/categories | jq '.[] | {title, path}'
```
Expected output: All paths should start with `/shop`, not `/shop-without-sidebar`

### 2. Test Category Filtering
```bash
# Test edible category
curl -s "https://your-domain.com/api/products?category=edible" | jq '.pagination.total'

# Test medicinal category
curl -s "https://your-domain.com/api/products?category=medicinal" | jq '.pagination.total'
```

### 3. Manual Browser Testing
1. Visit your production site
2. Navigate to category pages from the home page
3. Verify that category pages load without 404 errors
4. Test that product filtering works correctly

## Rollback Plan

If issues occur, you can rollback:

### 1. Restore Database Backup
```bash
# List available backups
npm run db:list

# Restore the most recent backup
npm run db:restore --backup=backup-YYYY-MM-DD-HH-MM-SS.sql
```

### 2. Revert Code Changes
```bash
# Revert to previous commit
git revert HEAD  # or
git checkout <previous-commit-hash>

# Redeploy
npm run build
vercel --prod
```

## Environment Variables

Ensure these environment variables are set in production:
- `DATABASE_URL`: Your production database URL
- `PRODUCTION_API_URL`: Your production API URL (for verification)

## Safety Checks

The deployment includes multiple safety checks:
- ✅ Automatic database backup before changes
- ✅ Verification of category path updates
- ✅ Build validation before deployment
- ✅ API endpoint testing
- ✅ Rollback procedures documented

## Success Criteria

The deployment is successful when:
- All category paths in the database point to `/shop`
- Category pages load without 404 errors
- Product filtering by category works correctly
- No existing functionality is broken

## Contact Information

If you encounter any issues during deployment:
1. Check the error logs
2. Verify database connectivity
3. Ensure all environment variables are set
4. Contact the development team if issues persist
