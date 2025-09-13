-- Fix category paths to use /shop instead of /shop-without-sidebar
-- This migration updates the paths in the Category table to fix 404 errors

-- Update All Mushrooms category path
UPDATE "Category" SET "path" = '/shop' WHERE "slug" = 'all-mushrooms';

-- Update Edible category path
UPDATE "Category" SET "path" = '/shop?category=edible' WHERE "slug" = 'edible';

-- Update Medicinal category path
UPDATE "Category" SET "path" = '/shop?category=medicinal' WHERE "slug" = 'medicinal';

-- Update Tinctures category path
UPDATE "Category" SET "path" = '/shop?category=tinctures' WHERE "slug" = 'tinctures';

-- Update Dry Powder category path
UPDATE "Category" SET "path" = '/shop?category=powders' WHERE "slug" = 'powders';

-- Log the changes
DO $$
BEGIN
    RAISE NOTICE 'Category paths updated successfully';
    RAISE NOTICE 'All category paths now point to /shop instead of /shop-without-sidebar';
END $$;
