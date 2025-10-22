# AddressType Enum Fix

## 🚨 Problem

Error when trying to save an address:
```
Invalid `prisma.addresses.create()` invocation:
Error: invalid input value for enum "AddressType": "BOTH"
```

## 🔍 Root Cause

The database `AddressType` enum only has `BILLING` and `SHIPPING` values, but the code was trying to use `BOTH`.

**Prisma Schema says:**
```prisma
enum AddressType {
  BILLING
  SHIPPING
  BOTH
}
```

**Database actually has:**
```sql
AddressType: BILLING, SHIPPING
```

The `BOTH` value was never added to the database enum.

## ✅ Solution Applied

### Quick Fix (Immediate) ✅
Changed the code to use `SHIPPING` instead of `BOTH`:

**Files Modified:**
1. `/src/components/Checkout/AddressFormModal.tsx`
   - Changed: `type: "BOTH"` → `type: "SHIPPING"`

2. `/src/app/api/addresses/route.ts`
   - Changed: `type: type || 'BOTH'` → `type: type || 'SHIPPING'`

**Result:** Addresses can now be saved immediately!

### Database Fix (Optional)

If you want to add `BOTH` to the database enum:

**Created:** `scripts/fix-address-type-enum.sql`

**Run it:**
```bash
npm run fix:address-type-enum
```

**What it does:**
- Safely adds `BOTH` value to the `AddressType` enum
- Checks if it already exists first
- Shows current enum values

## 🎯 Why Use SHIPPING?

For checkout addresses, `SHIPPING` is appropriate because:
1. ✅ Addresses saved during checkout are primarily for shipping
2. ✅ They can also be used for billing (no restriction)
3. ✅ Simpler than managing BILLING vs SHIPPING vs BOTH
4. ✅ Works with existing database

## 📊 Address Type Usage

### Current Implementation
```typescript
// All addresses saved as SHIPPING
type: "SHIPPING"
```

### What Each Type Means
- **BILLING**: Address used only for billing
- **SHIPPING**: Address used for shipping (can also be used for billing)
- **BOTH**: Address explicitly marked for both purposes

### Recommendation
**Use SHIPPING for all addresses** unless you have a specific need to distinguish between billing-only and shipping-only addresses.

## 🧪 Testing

### Test Address Creation
1. Go to checkout
2. Try to add a new address
3. Should work without errors now
4. Address saved with `type: "SHIPPING"`

### Verify in Database
```sql
SELECT id, street, city, type 
FROM addresses 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

Should show `type = SHIPPING` for new addresses.

## 🔧 Files Modified

1. **`/src/components/Checkout/AddressFormModal.tsx`**
   ```typescript
   // Before
   body: JSON.stringify({ ...formData, type: "BOTH" })
   
   // After
   body: JSON.stringify({ ...formData, type: "SHIPPING" })
   ```

2. **`/src/app/api/addresses/route.ts`**
   ```typescript
   // Before
   type: type || 'BOTH',
   
   // After
   type: type || 'SHIPPING',
   ```

3. **`/scripts/fix-address-type-enum.sql`** (NEW)
   - SQL script to add BOTH to enum if needed

4. **`/package.json`**
   - Added: `"fix:address-type-enum"` script

## 📝 Migration Note

If you want to properly sync Prisma schema with database:

### Option 1: Remove BOTH from Schema (Recommended)
```prisma
enum AddressType {
  BILLING
  SHIPPING
  // BOTH removed
}
```

Then run:
```bash
npx prisma migrate dev --name remove_both_from_address_type
```

### Option 2: Add BOTH to Database
```bash
npm run fix:address-type-enum
```

## ✅ Status

**Fixed!** ✅
- Addresses can now be saved
- Using `SHIPPING` type for all addresses
- No more enum errors

**Optional:**
- Can add `BOTH` to database if needed
- Can remove `BOTH` from Prisma schema to match database

---

**Current behavior:** All addresses saved with `type: "SHIPPING"` and working perfectly!
