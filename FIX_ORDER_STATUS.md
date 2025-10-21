# Fix OrderStatus Enum Error

## 🔴 Error You're Seeing:

```json
{
    "error": "Failed to place order",
    "details": "invalid input value for enum \"OrderStatus\": \"CONFIRMED\""
}
```

## 🔍 Root Cause:

Your database's `OrderStatus` enum is missing the `CONFIRMED` and possibly `COMPLETED` values that are defined in your Prisma schema.

## ✅ Solution:

### **Option 1: Run the Fix Script (Recommended)**

```bash
npm run fix:order-status-enum
```

This will:
- Add `CONFIRMED` to the OrderStatus enum if missing
- Add `COMPLETED` to the OrderStatus enum if missing
- Verify all enum values are correct

### **Option 2: Run SQL Directly**

If you have `psql` access:

```bash
psql "$DATABASE_URL" -f scripts/fix-order-status-enum.sql
```

### **Option 3: Manual SQL in Prisma Studio**

1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Or run this SQL directly in your database:

```sql
-- Add CONFIRMED if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CONFIRMED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
    ) THEN
        ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';
    END IF;
END $$;

-- Add COMPLETED if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'COMPLETED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
    ) THEN
        ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
    END IF;
END $$;
```

### **Option 4: Create and Run Migration**

```bash
# Create migration
npx prisma migrate dev --name add_order_status_values

# This will automatically sync your database with the schema
```

## 🎯 Expected OrderStatus Values:

After the fix, your `OrderStatus` enum should have these values:

1. ✅ PENDING
2. ✅ CONFIRMED
3. ✅ PROCESSING
4. ✅ SHIPPED
5. ✅ DELIVERED
6. ✅ CANCELLED
7. ✅ COMPLETED

## 🧪 Verify the Fix:

Run this to check your enum values:

```bash
tsx scripts/fix-order-status-enum.ts
```

Or query directly:

```sql
SELECT enumlabel as "OrderStatus Values"
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
ORDER BY enumsortorder;
```

## 📝 Why This Happened:

This typically occurs when:
1. Database was created before the schema had all enum values
2. A migration was skipped or failed
3. Database was manually modified
4. Schema was updated but migration wasn't run

## 🚀 Quick Fix Command:

```bash
npm run fix:order-status-enum
```

Then try placing your order again!

---

## 🔗 Related Files:

- **Fix Script:** `scripts/fix-order-status-enum.ts`
- **SQL Script:** `scripts/fix-order-status-enum.sql`
- **Prisma Schema:** `prisma/schema.prisma` (lines 488-496)

---

**After running the fix, your checkout should work properly!** ✅
