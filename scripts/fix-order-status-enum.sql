-- Fix OrderStatus enum to match Prisma schema
-- This adds CONFIRMED and COMPLETED values if they don't exist

-- First, check current enum values
DO $$
BEGIN
    -- Add CONFIRMED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CONFIRMED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
    ) THEN
        ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';
        RAISE NOTICE 'Added CONFIRMED to OrderStatus enum';
    ELSE
        RAISE NOTICE 'CONFIRMED already exists in OrderStatus enum';
    END IF;

    -- Add COMPLETED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'COMPLETED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
    ) THEN
        ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
        RAISE NOTICE 'Added COMPLETED to OrderStatus enum';
    ELSE
        RAISE NOTICE 'COMPLETED already exists in OrderStatus enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel as "OrderStatus Values"
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
ORDER BY enumsortorder;
