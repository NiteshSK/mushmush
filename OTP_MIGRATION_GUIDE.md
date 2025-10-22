# OTP Table Migration Guide

## 🚨 Issue

The OTP system needs a database table to store OTPs, but the table doesn't exist yet.

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'deleteMany')
at prisma.oTP.deleteMany
```

## ✅ Solution

The OTP model has been added to the Prisma schema. Now you need to create the database table.

## 📋 Steps to Fix

### Step 1: Create Migration
Run this command to create the OTP table:

```bash
npx prisma migrate dev --name add_otp_table
```

**What this does:**
- Creates a new migration file
- Creates the `otps` table in your database
- Regenerates Prisma Client with the new OTP model

### Step 2: Verify
After the migration completes, you should see:
```
✔ Generated Prisma Client
```

### Step 3: Test
Try the checkout flow again:
1. Go to checkout
2. Fill in details
3. Click "Proceed to Checkout"
4. OTP should be sent successfully ✅

## 📊 Database Table Created

The migration creates this table:

```sql
CREATE TABLE "otps" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "otp" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "otps_email_idx" ON "otps"("email");
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");
```

**Fields:**
- `id` - Unique identifier
- `email` - Email address (indexed for fast lookup)
- `otp` - The 6-digit OTP code
- `expiresAt` - When the OTP expires (indexed for cleanup)
- `createdAt` - When the OTP was created

## 🔧 Alternative: Manual Migration

If the automatic migration doesn't work, you can create the table manually:

```sql
-- Run this in your database
CREATE TABLE "otps" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "otp" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "otps_email_idx" ON "otps"("email");
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");
```

Then regenerate Prisma Client:
```bash
npx prisma generate
```

## 🧪 Verify Table Exists

Check if the table was created:

```sql
-- In your database
SELECT * FROM otps;
```

Or use Prisma Studio:
```bash
npx prisma studio
```

## 📁 What Was Changed

### 1. Prisma Schema (`prisma/schema.prisma`)
Added OTP model:
```prisma
model OTP {
  id        String   @id @default(cuid())
  email     String
  otp       String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([email])
  @@index([expiresAt])
  @@map("otps")
}
```

### 2. Migration File
Will be created in: `prisma/migrations/[timestamp]_add_otp_table/migration.sql`

## ✅ After Migration

Once the migration is complete:

1. ✅ OTP table exists in database
2. ✅ Prisma Client knows about OTP model
3. ✅ `prisma.oTP.deleteMany()` will work
4. ✅ OTP system fully functional

## 🎯 Expected Behavior

After fixing:
- ✅ OTPs stored in database
- ✅ First OTP works on first try
- ✅ OTPs persist across server restarts
- ✅ Automatic cleanup of expired OTPs
- ✅ Resend button works
- ✅ Security disclaimer shows

## 🚀 Quick Fix Command

Just run this one command:

```bash
npx prisma migrate dev --name add_otp_table
```

That's it! The OTP system will be fully functional after this.

---

**Status:** Schema updated ✅ | Migration needed ⏳
