-- Direct SQL to add benefits column to products table
-- This bypasses Prisma migration conflicts

-- First check if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'benefits'
    ) THEN
        RAISE NOTICE 'Column "benefits" already exists in products table';
    ELSE
        -- Add the column
        ALTER TABLE "products" ADD COLUMN "benefits" JSON NULL;
        RAISE NOTICE 'Column "benefits" added successfully to products table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'benefits';
