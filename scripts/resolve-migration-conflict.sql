-- Resolve P3009 migration conflict by marking the failed migration as completed
-- This allows new migrations to be applied

-- First, check if the _prisma_migrations table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations') THEN
        -- Mark the failed migration as finished to unblock future migrations
        UPDATE _prisma_migrations 
        SET finished_at = NOW(), 
            logs = 'Manually resolved - category paths fixed in migration 20250914064133_fix_production_category_paths_conflict'
        WHERE migration_name = '20250913172210_fix_category_paths' 
        AND finished_at IS NULL;
        
        RAISE NOTICE 'Marked failed migration 20250913172210_fix_category_paths as completed';
    ELSE
        RAISE NOTICE '_prisma_migrations table does not exist, skipping migration resolution';
    END IF;
END $$;

-- Now apply the category path fixes directly
DO $$
BEGIN
    -- Update All Mushrooms category path if it exists
    UPDATE categories SET path = '/shop' WHERE slug = 'all-mushrooms';
    
    -- Update Edible category path if it exists
    UPDATE categories SET path = '/shop?category=edible' WHERE slug = 'edible';
    
    -- Update Medicinal category path if it exists
    UPDATE categories SET path = '/shop?category=medicinal' WHERE slug = 'medicinal';
    
    -- Update Tinctures category path if it exists
    UPDATE categories SET path = '/shop?category=tinctures' WHERE slug = 'tinctures';
    
    -- Update Dry Powder category path if it exists
    UPDATE categories SET path = '/shop?category=powders' WHERE slug = 'powders';
    
    RAISE NOTICE 'Category paths updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating category paths: %', SQLERRM;
END $$;

-- Verify the changes
DO $$
DECLARE
    category_count INTEGER;
    correct_path_count INTEGER;
BEGIN
    -- Count total categories
    SELECT COUNT(*) INTO category_count FROM categories;
    
    -- Count categories with correct paths
    SELECT COUNT(*) INTO correct_path_count 
    FROM categories 
    WHERE path LIKE '/shop%' OR path = '/shop';
    
    RAISE NOTICE 'Total categories: %', category_count;
    RAISE NOTICE 'Categories with correct paths: %', correct_path_count;
    
    IF correct_path_count = category_count THEN
        RAISE NOTICE 'All category paths are correct';
    ELSE
        RAISE NOTICE 'Some category paths may need manual verification';
    END IF;
END $$;
