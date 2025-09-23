-- Resolve P3006 migration conflict by marking the failed migration as completed
-- This occurs when the instructorId column already exists in training_schedules table

-- First, check if the _prisma_migrations table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations') THEN
        -- Mark the failed migration as finished to unblock future migrations
        UPDATE _prisma_migrations 
        SET finished_at = NOW(), 
            logs = 'Manually resolved - instructorId column already exists in training_schedules table'
        WHERE migration_name = '20250917163000_add_instructorid_to_training_schedules' 
        AND finished_at IS NULL;
        
        RAISE NOTICE 'Marked failed migration 20250917163000_add_instructorid_to_training_schedules as completed';
    ELSE
        RAISE NOTICE '_prisma_migrations table does not exist, skipping migration resolution';
    END IF;
END $$;

-- Verify that instructorId column exists in training_schedules table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'training_schedules' 
        AND column_name = 'instructorid'
    ) THEN
        RAISE NOTICE 'instructorId column exists in training_schedules table';
    ELSE
        RAISE NOTICE 'instructorId column does not exist in training_schedules table';
    END IF;
END $$;

-- Check if foreign key constraint exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'training_schedules' 
        AND constraint_name = 'training_schedules_instructorId_fkey'
    ) THEN
        RAISE NOTICE 'Foreign key constraint training_schedules_instructorId_fkey exists';
    ELSE
        RAISE NOTICE 'Foreign key constraint training_schedules_instructorId_fkey does not exist';
    END IF;
END $$;

-- If foreign key constraint doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'training_schedules' 
        AND constraint_name = 'training_schedules_instructorId_fkey'
    ) THEN
        ALTER TABLE training_schedules 
        ADD CONSTRAINT training_schedules_instructorId_fkey 
        FOREIGN KEY (instructorId) REFERENCES instructors(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint training_schedules_instructorId_fkey';
    END IF;
END $$;

-- Check if index exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'training_schedules' 
        AND indexname = 'training_schedules_instructorId_idx'
    ) THEN
        RAISE NOTICE 'Index training_schedules_instructorId_idx exists';
    ELSE
        RAISE NOTICE 'Index training_schedules_instructorId_idx does not exist';
    END IF;
END $$;

-- If index doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'training_schedules' 
        AND indexname = 'training_schedules_instructorId_idx'
    ) THEN
        CREATE INDEX training_schedules_instructorId_idx ON training_schedules(instructorId);
        
        RAISE NOTICE 'Added index training_schedules_instructorId_idx';
    END IF;
END $$;

RAISE NOTICE 'Migration conflict resolution completed';
