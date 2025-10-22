#!/bin/bash

echo "=== Checking Git Status ==="
echo ""

echo "1. Current branch and status:"
git status -sb
echo ""

echo "2. Files modified but not staged:"
git diff --name-only
echo ""

echo "3. Files staged but not committed:"
git diff --cached --name-only
echo ""

echo "4. Last 3 commits:"
git log --oneline -3
echo ""

echo "5. Files in last commit:"
git show --name-only --pretty="" HEAD
echo ""

echo "6. Check if specific files have uncommitted changes:"
echo "   - prisma/schema.prisma:"
git diff HEAD prisma/schema.prisma | wc -l
echo "   - CheckoutWithOTP.tsx:"
git diff HEAD src/components/Checkout/CheckoutWithOTP.tsx | wc -l
echo "   - verify-and-place-order/route.ts:"
git diff HEAD src/app/api/checkout/verify-and-place-order/route.ts | wc -l
echo ""

echo "7. Check if files exist in last commit:"
git show HEAD:prisma/schema.prisma | grep "shippingAddress.*String" || echo "   ❌ shippingAddress field NOT in last commit"
echo ""

echo "8. Check if files exist locally:"
grep "shippingAddress.*String" prisma/schema.prisma && echo "   ✅ shippingAddress field EXISTS locally" || echo "   ❌ NOT found locally"
