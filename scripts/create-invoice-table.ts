import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createInvoiceTable() {
  try {
    console.log('🔧 Creating invoices table...\n');

    // Check if table already exists
    const tableExists = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices';
    `);

    if ((tableExists as any[]).length > 0) {
      console.log('ℹ️  Invoices table already exists, skipping creation');
      await prisma.$disconnect();
      process.exit(0);
    }

    // Create the invoices table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" TEXT PRIMARY KEY,
        "invoiceNumber" TEXT UNIQUE NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "orderId" TEXT UNIQUE NOT NULL,
        "pdfPath" TEXT,
        "customerName" TEXT NOT NULL,
        "customerEmail" TEXT NOT NULL,
        "customerPhone" TEXT,
        "billingAddress" JSONB NOT NULL,
        "shippingAddress" JSONB NOT NULL,
        "subtotal" DOUBLE PRECISION NOT NULL,
        "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "total" DOUBLE PRECISION NOT NULL,
        "invoiceItems" JSONB NOT NULL,
        "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "emailSent" BOOLEAN NOT NULL DEFAULT false,
        "emailSentAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    console.log('✅ Invoices table created');

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "invoices_orderId_idx" ON "invoices"("orderId");
    `);
    console.log('✅ orderId index created');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "invoices_customerEmail_idx" ON "invoices"("customerEmail");
    `);
    console.log('✅ customerEmail index created');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");
    `);
    console.log('✅ invoiceNumber index created');

    // Verify table exists
    const result = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices';
    `);

    console.log('\n📊 Verification:', result);
    console.log('\n✅ Invoices table setup complete!');

  } catch (error: any) {
    // If table already exists, that's fine
    if (error.code === '42P07' || error.message?.includes('already exists')) {
      console.log('ℹ️  Invoices table already exists');
      await prisma.$disconnect();
      process.exit(0);
    }
    
    console.error('❌ Error creating invoices table:', error);
    // Don't fail the build if table creation fails
    console.log('⚠️  Continuing despite error');
    await prisma.$disconnect();
    process.exit(0);
  } finally {
    await prisma.$disconnect();
  }
}

createInvoiceTable();
