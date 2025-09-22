-- Add quantity field to products table for inventory management
ALTER TABLE "products" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN "products"."quantity" IS 'Current stock quantity for inventory tracking';

-- Update existing products to have a default quantity of 50 (reasonable starting stock)
UPDATE "products" SET "quantity" = 50 WHERE "quantity" = 0;
