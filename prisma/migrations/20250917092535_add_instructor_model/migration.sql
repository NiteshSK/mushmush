/*
  Warnings:

  - You are about to drop the column `instructor` on the `training_schedules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."training_schedules" DROP COLUMN "instructor",
ADD COLUMN     "instructorId" INTEGER;

-- CreateTable
CREATE TABLE "public"."instructors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "expertise" TEXT,
    "experience" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instructors_name_key" ON "public"."instructors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "instructors_email_key" ON "public"."instructors"("email");

-- AddForeignKey
ALTER TABLE "public"."training_schedules" ADD CONSTRAINT "training_schedules_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
