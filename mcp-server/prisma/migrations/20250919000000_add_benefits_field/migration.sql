-- Add benefits field to products table
ALTER TABLE "products" ADD COLUMN "benefits" JSON NULL;

-- Add comment for documentation
COMMENT ON COLUMN "products"."benefits" IS 'JSON field storing mushroom benefits data';
