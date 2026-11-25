-- DRAFT — do not copy into prisma/migrations until the target database is reviewed.
--
-- Brings a database whose history is prisma/migrations (through 20260404) up to
-- prisma/schema.prisma WITHOUT removing anything. Every statement is guarded, so
-- the script also succeeds on a database that already has some or all of these
-- objects (for example one that was synchronised with `prisma db push`).
--
-- Deliberately NOT included (they remove data or indexes; decide separately):
--   training_registrations: paymentDate, paymentMethod, paymentReference,
--                           paymentStatus, upiTransactionId   (old payment records)
--   users: address
--   indexes addresses_userId_idx, orders_billingAddressId_idx,
--           orders_shippingAddressId_idx   (keep; add @@index to the schema instead)

-- Enums -------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE n.nspname = 'public' AND t.typname = 'InvoiceStatus') THEN
    CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'VOID');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE n.nspname = 'public' AND t.typname = 'UpiPaymentStatus') THEN
    CREATE TYPE "public"."UpiPaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');
  END IF;
END $$;

ALTER TYPE "public"."OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_RECEIVED';
ALTER TYPE "public"."OrderStatus" ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE "public"."OrderStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE "public"."RegistrationStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_RECEIVED';

-- Columns -----------------------------------------------------------------
ALTER TABLE "public"."orders"
  ADD COLUMN IF NOT EXISTS "couponDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "couponId" INTEGER;

-- Integer to double precision keeps every existing value.
ALTER TABLE "public"."products"
  ALTER COLUMN "quantity" SET DEFAULT 0,
  ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Tables ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrderValue" DOUBLE PRECISION,
    "maxDiscount" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "maxUsesPerEmail" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."coupon_usages" (
    "id" TEXT NOT NULL,
    "couponId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "pdfPath" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "subtotal" DOUBLE PRECISION,
    "tax" DOUBLE PRECISION,
    "shipping" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "invoiceItems" JSONB,
    "generatedAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."upi_payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."UpiPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "resourceType" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT,
    "trainingRegistrationId" TEXT,
    "verifiedByUserId" TEXT,
    CONSTRAINT "upi_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "phone" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."global_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "group" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "global_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."shipping_zones" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pincodeFrom" TEXT NOT NULL,
    "pincodeTo" TEXT NOT NULL,
    "baseFee" DOUBLE PRECISION NOT NULL,
    "freeAbove" DOUBLE PRECISION,
    "estimatedDays" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- Indexes -----------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "public"."coupons"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "coupon_usages_orderId_key" ON "public"."coupon_usages"("orderId");
CREATE INDEX IF NOT EXISTS "coupon_usages_couponId_email_idx" ON "public"."coupon_usages"("couponId", "email");
CREATE INDEX IF NOT EXISTS "coupon_usages_email_idx" ON "public"."coupon_usages"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_orderId_key" ON "public"."invoices"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "upi_payments_transactionId_key" ON "public"."upi_payments"("transactionId");
CREATE INDEX IF NOT EXISTS "otps_email_idx" ON "public"."otps"("email");
CREATE INDEX IF NOT EXISTS "otps_expiresAt_idx" ON "public"."otps"("expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "global_configs_key_key" ON "public"."global_configs"("key");
CREATE INDEX IF NOT EXISTS "shipping_zones_pincodeFrom_pincodeTo_idx" ON "public"."shipping_zones"("pincodeFrom", "pincodeTo");
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_key" ON "public"."newsletter_subscribers"("email");

-- Foreign keys ------------------------------------------------------------
DO $$
DECLARE fk record;
BEGIN
  FOR fk IN SELECT * FROM (VALUES
    ('orders', 'orders_couponId_fkey',
     'FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE'),
    ('coupon_usages', 'coupon_usages_couponId_fkey',
     'FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
    ('coupon_usages', 'coupon_usages_orderId_fkey',
     'FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
    ('invoices', 'invoices_orderId_fkey',
     'FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
    ('upi_payments', 'upi_payments_orderId_fkey',
     'FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
    ('upi_payments', 'upi_payments_trainingRegistrationId_fkey',
     'FOREIGN KEY ("trainingRegistrationId") REFERENCES "public"."training_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
    ('upi_payments', 'upi_payments_verifiedByUserId_fkey',
     'FOREIGN KEY ("verifiedByUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE')
  ) AS t(tbl, name, def)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fk.name) THEN
      EXECUTE format('ALTER TABLE "public".%I ADD CONSTRAINT %I %s', fk.tbl, fk.name, fk.def);
    END IF;
  END LOOP;
END $$;
