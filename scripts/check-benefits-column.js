const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBenefitsColumn() {
  try {
    console.log('Checking if benefits column exists...');
    
    // Try to query the products table and see if benefits column exists
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'benefits'
    `;
    
    console.log('Query result:', result);
    
    if (result && result.length > 0) {
      console.log('✅ Benefits column exists!');
      console.log('Column details:', result[0]);
    } else {
      console.log('❌ Benefits column does not exist');
      
      // List all columns in products table
      const allColumns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products'
        ORDER BY ordinal_position
      `;
      
      console.log('All columns in products table:');
      allColumns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking benefits column:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBenefitsColumn();
