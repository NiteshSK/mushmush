-- Manual migration to add ProductDiscount table and DiscountType enum
-- This preserves existing discountedPrice data

-- Create DiscountType enum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- Create ProductDiscount table
CREATE TABLE "product_discounts" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_discounts_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "product_discounts" ADD CONSTRAINT "product_discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing discountedPrice data to new discount system
-- Only for products that have a discountedPrice different from price
INSERT INTO "product_discounts" ("productId", "type", "value", "isActive")
SELECT 
    id,
    'FIXED_AMOUNT'::"DiscountType",
    (price - "discountedPrice") as value,
    true
FROM "products" 
WHERE "discountedPrice" IS NOT NULL 
  AND "discountedPrice" < price 
  AND "discountedPrice" > 0;

-- Note: We're keeping the discountedPrice column for now as fallback
-- It can be removed later once the new system is fully tested
