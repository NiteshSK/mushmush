-- Add billingAddressId and shippingAddressId columns to orders table if they don't exist
DO $$ 
BEGIN
    -- Add billingAddressId column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'billingAddressId'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "billingAddressId" TEXT;
    END IF;

    -- Add shippingAddressId column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shippingAddressId'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "shippingAddressId" TEXT;
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key for billingAddressId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_billingAddressId_fkey'
    ) THEN
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_billingAddressId_fkey" 
        FOREIGN KEY ("billingAddressId") 
        REFERENCES "addresses"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for shippingAddressId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_shippingAddressId_fkey'
    ) THEN
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_shippingAddressId_fkey" 
        FOREIGN KEY ("shippingAddressId") 
        REFERENCES "addresses"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "orders_billingAddressId_idx" ON "orders"("billingAddressId");
CREATE INDEX IF NOT EXISTS "orders_shippingAddressId_idx" ON "orders"("shippingAddressId");
