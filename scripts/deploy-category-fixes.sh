#!/bin/bash

# Production deployment script for category path fixes
# This script will:
# 1. Create a database backup
# 2. Run the category path fix script
# 3. Verify the changes
# 4. Deploy the updated code

set -e

echo "🚀 Starting production category path fixes deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# 1. Create backup using TypeScript script
echo "📦 Creating backup..."
npx ts-node scripts/backup-production-db.ts
if [ $? -eq 0 ]; then
    print_status "Database backup created successfully"
else
    print_error "Failed to create database backup"
    exit 1
fi

# 2. Build the application
echo "🔨 Building application..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

# 3. Run the category path fix script
echo "🔧 Fixing category paths in production..."
npx ts-node scripts/fix-production-category-paths.ts
if [ $? -eq 0 ]; then
    print_status "Category paths fixed successfully"
else
    print_error "Failed to fix category paths"
    exit 1
fi

# 4. Verify the changes
echo "🔍 Verifying category path changes directly in the database..."
npx ts-node scripts/verify-category-paths.ts

if [ $? -eq 0 ]; then
    print_status "All category paths verified successfully"
else
    print_error "Verification of category paths failed."
    exit 1
fi

# 5. Apply Prisma migrations (including P3009 conflict resolution)
echo "📋 Step 4: Applying Prisma migrations (including P3009 conflict resolution)..."
# Apply all pending migrations, including the one that resolves P3009 conflict
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    print_status "Migrations applied successfully"
else
    print_error "Migration failed - attempting to restore from backup"
    # Restore from backup
    npm run db:restore
    print_warning "Backup restored"
    exit 1
fi

# 6. Deploy to production (if using Vercel)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    if [ $? -eq 0 ]; then
        print_status "Successfully deployed to production"
    else
        print_error "Failed to deploy to production"
        exit 1
    fi
else
    print_warning "Vercel CLI not found. Please deploy manually using your deployment method"
fi

echo "🎉 Production category path fixes deployment completed successfully!"
echo "📝 Summary:"
echo "   - Database backup created"
echo "   - Category paths updated in production database"
echo "   - Changes verified"
echo "   - Application deployed to production"
