import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixInvoiceTableColumns() {
  try {
    console.log('🔧 Fixing invoices table columns...\n');

    // Create InvoiceStatus enum if it doesn't exist
    console.log('📝 Creating InvoiceStatus enum...');
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'VOID');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log('✅ InvoiceStatus enum created/verified');
    } catch (e: any) {
      console.log('⚠️  InvoiceStatus enum:', e.message);
    }

    // Check if table exists
    const tableExists = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices';
    `);

    if ((tableExists as any[]).length === 0) {
      console.log('❌ Invoices table does not exist. Run create-invoice-table.ts first.');
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log('✅ Invoices table exists');

    // Check which columns exist
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices';
    `);

    const columnNames = (columns as any[]).map(c => c.column_name);
    console.log('📊 Existing columns:', columnNames.join(', '));

    // Add issuedAt if missing
    if (!columnNames.includes('issuedAt')) {
      console.log('\n➕ Adding issuedAt column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "invoices" 
        ADD COLUMN "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✅ issuedAt column added');
    } else {
      console.log('✅ issuedAt column already exists');
    }

    // Add dueAt if missing
    if (!columnNames.includes('dueAt')) {
      console.log('\n➕ Adding dueAt column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "invoices" 
        ADD COLUMN "dueAt" TIMESTAMP(3);
      `);
      console.log('✅ dueAt column added');
    } else {
      console.log('✅ dueAt column already exists');
    }

    // Fix status column type to use enum
    console.log('\n🔄 Updating status column to use InvoiceStatus enum...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "invoices" 
        ALTER COLUMN "status" TYPE "InvoiceStatus" 
        USING "status"::"InvoiceStatus";
      `);
      console.log('✅ status column updated to use InvoiceStatus enum');
    } catch (e: any) {
      // Column might already be using the enum
      if (e.code === '42804' || e.message?.includes('already')) {
        console.log('✅ status column already uses InvoiceStatus enum');
      } else {
        console.log('⚠️  status column update:', e.message);
      }
    }

    // Make nullable columns that should be nullable
    const nullableColumns = [
      'customerName',
      'customerEmail', 
      'customerPhone',
      'billingAddress',
      'shippingAddress',
      'subtotal',
      'tax',
      'shipping',
      'total',
      'invoiceItems',
      'generatedAt'
    ];

    console.log('\n🔄 Making columns nullable...');
    for (const col of nullableColumns) {
      if (columnNames.includes(col)) {
        try {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "invoices" 
            ALTER COLUMN "${col}" DROP NOT NULL;
          `);
          console.log(`✅ ${col} is now nullable`);
        } catch (e: any) {
          // Column might already be nullable
          if (e.code !== '42804') {
            console.log(`⚠️  ${col}: ${e.message}`);
          }
        }
      }
    }

    // Verify final schema
    console.log('\n📊 Final column check:');
    const finalColumns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices'
      ORDER BY ordinal_position;
    `);

    console.table(finalColumns);

    console.log('\n✅ Invoice table columns fixed successfully!');

  } catch (error: any) {
    console.error('❌ Error fixing invoice table:', error);
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixInvoiceTableColumns();
