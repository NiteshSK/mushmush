# Deploy Duplicate Address Fix to Production

## 🚨 Current Issue in Production

**Problem:** Addresses are duplicating on every order in production because the fix hasn't been deployed yet.

**Screenshot shows:** 5 identical addresses for the same user

## ✅ Files That Need to Be Deployed

### Critical Files (Must Deploy)

1. **`prisma/schema.prisma`**
   - Added `shippingAddress String` field to Order model
   - Required for database compatibility

2. **`src/components/Checkout/CheckoutWithOTP.tsx`**
   - Sends `billingAddressId` and `shippingAddressId` 
   - Prevents creating new addresses when using saved ones

3. **`src/app/api/checkout/verify-and-place-order/route.ts`**
   - Checks if address IDs are provided
   - Reuses existing addresses instead of creating new ones
   - Adds `shippingAddress` string field

4. **`src/app/api/orders/route.ts`** ✅ Already committed
   - Fixed to include shippingAddress field

5. **`scripts/test-invoice-system.ts`** ✅ Already committed
   - Fixed test script

### Documentation Files (Optional)
- `DUPLICATE_ADDRESS_FIX.md`
- `OTP_SYSTEM_FIX.md`
- `OTP_RATE_LIMITING_SUMMARY.md`
- `OTP_MIGRATION_GUIDE.md`

## 📋 Deployment Steps

### Step 1: Commit All Changes

```bash
# Check what needs to be committed
git status

# Add all modified files
git add prisma/schema.prisma
git add src/components/Checkout/CheckoutWithOTP.tsx
git add src/app/api/checkout/verify-and-place-order/route.ts
git add *.md  # Documentation

# Commit with descriptive message
git commit -m "Fix: Prevent duplicate address creation on checkout

- Send address IDs from frontend when using saved addresses
- Reuse existing addresses in backend instead of creating new ones
- Add shippingAddress field to Order model for database compatibility
- Only create new addresses when user enters new address manually

This fixes the issue where every order was creating duplicate addresses."

# Push to production
git push origin main
```

### Step 2: Run Database Migration (if needed)

If Prisma schema changed, you may need to run:

```bash
# On production server or via deployment script
npx prisma generate
npx prisma migrate deploy
```

### Step 3: Clean Up Existing Duplicates

After deployment, run the cleanup script:

```bash
npm run fix:duplicate-addresses
```

This will remove existing duplicate addresses while keeping one copy of each.

### Step 4: Verify Fix

1. **Test Checkout:**
   - Go to production site
   - Select saved address
   - Complete checkout
   - ✅ Check: No new duplicate address created

2. **Check Database:**
   ```sql
   SELECT 
     userId,
     street,
     city,
     COUNT(*) as count
   FROM addresses
   GROUP BY userId, street, city
   HAVING COUNT(*) > 1;
   ```
   Should return 0 rows after fix.

## 🔍 How to Verify Deployment

### Before Deployment
```
User places order with saved address
→ Creates 2 new addresses (billing + shipping)
→ Duplicates keep growing ❌
```

### After Deployment
```
User places order with saved address
→ Reuses existing address
→ No duplicates created ✅
```

## ⚠️ Important Notes

### Why Production Still Has Duplicates

The production server is running the **old code** that:
1. Always creates new addresses
2. Doesn't check for existing addresses
3. Doesn't send/receive address IDs

### What Happens After Deployment

The production server will run the **new code** that:
1. ✅ Sends address IDs from frontend
2. ✅ Checks if address ID is provided
3. ✅ Reuses existing addresses
4. ✅ Only creates new when needed

### Database Compatibility

The `shippingAddress` field was added to the Order model because:
- Production database has this column (NOT NULL)
- It wasn't in the Prisma schema
- This caused "null constraint violation" errors

Now both fields are used:
- `shippingAddress` (String) - Legacy formatted address
- `shippingAddressId` (String?) - Reference to addresses table

## 🎯 Expected Results

### Immediate Effects
- ✅ No more duplicate addresses on new orders
- ✅ Existing addresses reused properly
- ✅ Checkout works without errors

### Long-term Benefits
- ✅ Clean address database
- ✅ Better user experience
- ✅ Faster address selection
- ✅ Reduced storage

## 🧪 Testing Checklist

After deployment, test these scenarios:

### Test 1: Saved Address (No Duplicates)
```
1. Login to production
2. Go to checkout
3. Select saved address
4. Complete order
5. ✅ Check addresses table - no new address
6. ✅ Check order - uses existing address ID
```

### Test 2: New Address (Creates One)
```
1. Go to checkout
2. Enter new address manually
3. Complete order
4. ✅ Check addresses table - 1 new address created
5. ✅ Address saved for future use
```

### Test 3: Multiple Orders (No Duplicates)
```
1. Place order 1 with saved address
2. Place order 2 with same saved address
3. Place order 3 with same saved address
4. ✅ Check addresses table - still only 1 address
5. ✅ All orders reference same address
```

## 📊 Current Production State

Based on screenshot:
- **User:** Has 5 identical addresses
- **Issue:** All 5 are the same address duplicated
- **Cause:** Old code creating new address on every order
- **Solution:** Deploy new code + run cleanup script

## 🚀 Quick Deploy Command

```bash
# One-liner to commit and push everything
git add prisma/schema.prisma src/components/Checkout/CheckoutWithOTP.tsx src/app/api/checkout/verify-and-place-order/route.ts && \
git commit -m "Fix: Prevent duplicate address creation" && \
git push origin main
```

## 📞 Rollback Plan (If Needed)

If something goes wrong:

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

Or:

```bash
# Reset to specific commit
git reset --hard <previous-commit-hash>
git push origin main --force
```

---

**Status:** Ready to deploy
**Priority:** HIGH - Addresses duplicating on every order
**Impact:** All users placing orders
