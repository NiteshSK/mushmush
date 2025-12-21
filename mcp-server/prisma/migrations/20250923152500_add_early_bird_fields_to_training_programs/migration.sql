-- Add early bird pricing fields to training programs
ALTER TABLE "public"."training_programs" 
ADD COLUMN "hasEarlyBirdOffer" BOOLEAN DEFAULT false,
ADD COLUMN "earlyBirdPrice" DOUBLE PRECISION,
ADD COLUMN "originalPrice" DOUBLE PRECISION,
ADD COLUMN "earlyBirdEndDate" TIMESTAMP(3);
