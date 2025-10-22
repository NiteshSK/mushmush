#!/bin/bash

echo "🔍 Checking modified files..."
git status

echo ""
echo "📦 Adding critical files..."
git add prisma/schema.prisma
git add src/components/Checkout/CheckoutWithOTP.tsx
git add src/app/api/checkout/verify-and-place-order/route.ts

echo ""
echo "📝 Committing changes..."
git commit -m "Fix: Prevent duplicate address creation - CODE CHANGES

Critical fixes:
- prisma/schema.prisma: Add shippingAddress field to Order model
- CheckoutWithOTP.tsx: Send address IDs to prevent duplicate creation
- verify-and-place-order: Reuse existing addresses instead of creating new ones

This commit contains the actual code changes (previous commit was docs only)"

echo ""
echo "🚀 Pushing to production..."
git push origin main

echo ""
echo "✅ Done! Code deployed to production."
echo ""
echo "Next steps:"
echo "1. Wait for deployment to complete"
echo "2. Run: npm run fix:duplicate-addresses (to clean existing duplicates)"
echo "3. Test checkout with saved address"
