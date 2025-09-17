-- CreateTable
CREATE TABLE "public"."training_schedules" (
    "id" SERIAL NOT NULL,
    "trainingProgramId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topics" JSONB NOT NULL,
    "practicalSessions" JSONB NOT NULL,
    "theoreticalSessions" JSONB NOT NULL,
    "learningObjectives" JSONB NOT NULL,
    "materials" JSONB NOT NULL,
    "instructor" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."training_schedules" ADD CONSTRAINT "training_schedules_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
