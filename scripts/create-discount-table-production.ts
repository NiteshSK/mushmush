import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDiscountTableInProduction() {
  try {
    console.log('🚀 Creating ProductDiscount table in production...')
    
    // Create DiscountType enum
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    console.log('✅ DiscountType enum created/verified')
    
    // Create ProductDiscount table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "product_discounts" (
        "id" SERIAL NOT NULL,
        "productId" INTEGER NOT NULL,
        "type" "DiscountType" NOT NULL,
        "value" DOUBLE PRECISION NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "product_discounts_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✅ ProductDiscount table created')
    
    // Add foreign key constraint
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "product_discounts" 
        ADD CONSTRAINT "product_discounts_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "products"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    console.log('✅ Foreign key constraint added')
    
    // Verify table creation
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_discounts'
      );
    `
    
    console.log('📊 Table verification:', tableExists)
    
    // Test the table by counting records
    const discountCount = await prisma.productDiscount.count()
    console.log(`🎉 ProductDiscount table ready with ${discountCount} records`)
    
  } catch (error) {
    console.error('❌ Error creating discount table:', error)
    
    // Check if table already exists
    try {
      const count = await prisma.productDiscount.count()
      console.log('ℹ️ ProductDiscount table already exists with', count, 'records')
    } catch (e) {
      console.log('💡 Table creation failed, check database permissions')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createDiscountTableInProduction()
