#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resolveMigrationConflict() {
  try {
    console.log('Checking if instructorId column already exists in training_schedules table...');
    
    // Check if the column already exists by trying to query it
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'training_schedules' 
      AND column_name = 'instructorId'
    ` as Array<{ column_name: string }>;
    
    if (result.length > 0) {
      console.log('✅ instructorId column already exists in training_schedules table');
      console.log('The migration 20250917163000_add_instructorid_to_training_schedules should be marked as applied');
      
      // Instructions for manual resolution
      console.log('\n📋 To resolve this migration conflict, run:');
      console.log('npx prisma migrate resolve --applied 20250917163000_add_instructorid_to_training_schedules');
      
      console.log('\n📋 Then continue with the build:');
      console.log('npm run build');
    } else {
      console.log('❌ instructorId column does not exist. This is unexpected.');
      console.log('The migration should be applied normally.');
    }
  } catch (error) {
    console.error('Error checking column existence:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resolveMigrationConflict();
