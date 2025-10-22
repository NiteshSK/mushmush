#!/bin/bash

echo "🚀 Fixing OrderStatus enum in PRODUCTION database..."
echo ""
echo "⚠️  WARNING: This will modify your PRODUCTION database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "📡 Connecting to production database..."
echo ""

# Run the SQL fix on production database
psql "$DATABASE_URL" << 'EOF'
-- Add CONFIRMED if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CONFIRMED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
    ) THEN
        ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';
        RAISE NOTICE '✅ Added CONFIRMED to OrderStatus enum';
    ELSE
        RAISE NOTICE 'ℹ️  CONFIRMED already exists in OrderStatus enum';
    END IF;
END $$;

-- Add COMPLETED if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'COMPLETED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
    ) THEN
        ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
        RAISE NOTICE '✅ Added COMPLETED to OrderStatus enum';
    ELSE
        RAISE NOTICE 'ℹ️  COMPLETED already exists in OrderStatus enum';
    END IF;
END $$;

-- Verify enum values
SELECT '📋 Current OrderStatus values:' as status;
SELECT enumlabel as "Value", enumsortorder as "Order"
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')
ORDER BY enumsortorder;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production OrderStatus enum fixed successfully!"
    echo ""
else
    echo ""
    echo "❌ Failed to fix production database!"
    echo ""
    exit 1
fi
