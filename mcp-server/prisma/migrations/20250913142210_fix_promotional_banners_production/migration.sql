-- Fix for production migration failure
-- This migration handles the case where DiscountType enum and tables might already exist

-- Create DiscountType enum only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountType') THEN
        CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
    END IF;
END $$;

-- Remove discountedPrice column from products if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'discountedPrice'
    ) THEN
        ALTER TABLE "public"."products" DROP COLUMN "discountedPrice";
    END IF;
END $$;

-- Create product_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."product_notifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_notifications_pkey" PRIMARY KEY ("id")
);

-- Create product_discounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."product_discounts" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_discounts_pkey" PRIMARY KEY ("id")
);

-- Create promotional_banners table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."promotional_banners" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "discount" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Buy Now',
    "buttonLink" TEXT,
    "productId" INTEGER,
    "categoryId" INTEGER,
    "imageUrl" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT '#F5F5F7',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "promotional_banners_pkey" PRIMARY KEY ("id")
);

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'product_notifications_email_productId_key') THEN
        CREATE UNIQUE INDEX "product_notifications_email_productId_key" ON "public"."product_notifications"("email", "productId");
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Check and add product_notifications foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_notifications_productId_fkey'
    ) THEN
        ALTER TABLE "public"."product_notifications" 
        ADD CONSTRAINT "product_notifications_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Check and add product_discounts foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_discounts_productId_fkey'
    ) THEN
        ALTER TABLE "public"."product_discounts" 
        ADD CONSTRAINT "product_discounts_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Check and add promotional_banners product foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'promotional_banners_productId_fkey'
    ) THEN
        ALTER TABLE "public"."promotional_banners" 
        ADD CONSTRAINT "promotional_banners_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Check and add promotional_banners category foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'promotional_banners_categoryId_fkey'
    ) THEN
        ALTER TABLE "public"."promotional_banners" 
        ADD CONSTRAINT "promotional_banners_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;