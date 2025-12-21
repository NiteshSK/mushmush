-- CreateEnum
CREATE TYPE "public"."TrainingType" AS ENUM ('OYSTER', 'BUTTON', 'SHIITAKE', 'GANODERMA');

-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."training_programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "dailyHours" TEXT NOT NULL DEFAULT '5-6 hours',
    "type" "public"."TrainingType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_registrations" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "participantName" TEXT NOT NULL,
    "participantEmail" TEXT NOT NULL,
    "participantPhone" TEXT NOT NULL,
    "participantAddress" JSONB NOT NULL,
    "preferredStartDate" TIMESTAMP(3),
    "specialRequirements" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainingProgramId" INTEGER NOT NULL,
    "userId" TEXT,

    CONSTRAINT "training_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_programs_name_key" ON "public"."training_programs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "training_programs_slug_key" ON "public"."training_programs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "training_registrations_registrationNumber_key" ON "public"."training_registrations"("registrationNumber");

-- AddForeignKey
ALTER TABLE "public"."training_registrations" ADD CONSTRAINT "training_registrations_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_registrations" ADD CONSTRAINT "training_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
