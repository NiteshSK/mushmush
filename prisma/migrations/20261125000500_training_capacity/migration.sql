ALTER TABLE training_programs ADD COLUMN "seatsPerDate" INTEGER CHECK ("seatsPerDate" > 0);
