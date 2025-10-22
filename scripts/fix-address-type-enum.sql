-- Fix AddressType enum to include BOTH value
-- This script safely adds the BOTH value if it doesn't exist

DO $$ 
BEGIN
    -- Check if BOTH value exists in AddressType enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'BOTH' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'AddressType'
        )
    ) THEN
        -- Add BOTH to the enum
        ALTER TYPE "AddressType" ADD VALUE 'BOTH';
        RAISE NOTICE 'Added BOTH to AddressType enum';
    ELSE
        RAISE NOTICE 'BOTH already exists in AddressType enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel as "AddressType Values"
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'AddressType'
)
ORDER BY enumsortorder;
