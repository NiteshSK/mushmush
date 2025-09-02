import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDiscountTable() {
  try {
    console.log('🔍 Checking ProductDiscount table...\n');
    
    const discounts = await prisma.productDiscount.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`📊 Total discounts in table: ${discounts.length}\n`);

    discounts.forEach(discount => {
      console.log(`Discount ID: ${discount.id}`);
      console.log(`  Product: ${discount.product.title} (ID: ${discount.productId})`);
      console.log(`  Type: ${discount.type}`);
      console.log(`  Value: ${discount.value}`);
      console.log(`  Active: ${discount.isActive}`);
      console.log(`  Start Date: ${discount.startDate}`);
      console.log(`  End Date: ${discount.endDate}`);
      console.log(`  Current Date: ${new Date()}`);
      console.log(`  Is Date Valid: ${discount.startDate <= new Date() && discount.endDate >= new Date()}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDiscountTable();
