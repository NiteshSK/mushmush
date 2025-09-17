-- Add instructorId column to training_schedules table
ALTER TABLE "training_schedules" ADD COLUMN "instructorId" INTEGER;

-- Add foreign key constraint
ALTER TABLE "training_schedules" ADD CONSTRAINT "training_schedules_instructorId_fkey" 
FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX "training_schedules_instructorId_idx" ON "training_schedules"("instructorId");
