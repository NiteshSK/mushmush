import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnums() {
  try {
    // Check if DiscountType enum exists in database
    const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'DiscountType'
      );
    `;
    
    console.log('DiscountType enum values in database:', result);
    
    // Check all enums in the database
    const allEnums = await prisma.$queryRaw`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `;
    
    console.log('All enums in database:', allEnums);
    
  } catch (error) {
    console.error('Error checking enums:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnums();
