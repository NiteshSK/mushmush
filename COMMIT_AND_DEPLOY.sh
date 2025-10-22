#!/bin/bash

echo "🔍 Checking current status..."
git status

echo ""
echo "📦 Adding all modified files..."
git add package.json
git add scripts/create-otp-table.ts
git add prisma/schema.prisma
git add src/components/Checkout/CheckoutWithOTP.tsx
git add src/app/api/checkout/verify-and-place-order/route.ts
git add deploy-fix.sh
git add DEPLOY_DUPLICATE_FIX.md
git add COMMIT_AND_DEPLOY.sh

echo ""
echo "📝 Committing all changes..."
git commit -m "Deploy: Fix duplicate addresses + OTP system

Critical Changes:
1. Prisma Schema: Add shippingAddress field to Order model
2. CheckoutWithOTP: Send address IDs to prevent duplicates
3. verify-and-place-order API: Reuse existing addresses
4. create-otp-table script: Production-safe with error handling
5. package.json: Add postbuild script for OTP table creation

This deployment will:
- Fix duplicate address creation on every order
- Create OTP table automatically on Vercel
- Handle existing tables gracefully
- Not fail build if OTP table already exists"

echo ""
echo "🚀 Pushing to GitHub (triggers Vercel deployment)..."
git push origin main

echo ""
echo "✅ Done! Deployment triggered."
echo ""
echo "📊 Next steps:"
echo "1. Monitor Vercel deployment logs"
echo "2. Check for 'postbuild' script execution"
echo "3. Verify OTP table creation message"
echo "4. Test checkout on production"
echo "5. Run cleanup: npm run fix:duplicate-addresses (with production DB)"
echo ""
echo "🔗 Check deployment at: https://vercel.com/dashboard"
