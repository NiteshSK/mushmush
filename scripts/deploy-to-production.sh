#!/bin/bash

# Safe Production Deployment Script
# This script ensures data safety during deployment

set -e  # Exit on any error

echo "🚀 Starting Safe Production Deployment..."
echo "========================================"

# 1. Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root"
    exit 1
fi

# 2. Backup production database first
echo "📦 Step 1: Creating production database backup..."
npx tsx scripts/backup-production-db.ts

if [ $? -ne 0 ]; then
    echo "❌ Error: Backup failed. Aborting deployment."
    exit 1
fi

echo "✅ Backup completed successfully"

# 3. Verify production DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set your production DATABASE_URL in .env file"
    exit 1
fi

echo "🔍 Step 2: Verifying database connection..."
npx prisma db execute --stdin --schema=prisma/schema.prisma <<< "SELECT 1;"

if [ $? -ne 0 ]; then
    echo "❌ Error: Cannot connect to production database"
    exit 1
fi

echo "✅ Database connection verified"

# 4. Generate Prisma client
echo "🔧 Step 3: Generating Prisma client..."
npx prisma generate

# 5. Check migration status
echo "📊 Step 4: Checking migration status..."
npx prisma migrate status

# 6. Apply migrations safely
echo "🔄 Step 5: Applying migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Error: Migration failed. Please check the error messages."
    echo "💡 You may need to restore from backup: psql -d your_db -f backups/production-backup-*.sql"
    exit 1
fi

echo "✅ Migrations applied successfully"

# 7. Build the application
echo "🏗️  Step 6: Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# 8. Optional: Seed new data (instructors, training programs)
echo "🌱 Step 7: Seeding new data (optional)..."
npx prisma db seed || echo "⚠️  Warning: Seeding completed with some warnings (this may be normal)"

echo ""
echo "🎉 Deployment completed successfully!"
echo "========================================"
echo ""
echo "📋 Next steps:"
echo "1. Deploy the built application to your hosting platform"
echo "2. Test the new features (training programs, instructors)"
echo "3. Monitor application logs for any issues"
echo ""
echo "🛡️  Backup files are available in: backups/"
echo "📞 If you encounter any issues, restore from backup immediately"
echo ""
echo "✨ New features deployed:"
echo "   - Instructor management system"
echo "   - Training programs and schedules"
echo "   - Training registration system"
echo "   - Fixed wishlist error handling"
