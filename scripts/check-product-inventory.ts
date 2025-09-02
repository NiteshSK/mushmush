import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductInventory() {
  try {
    console.log('Checking product inventory status...\n');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        inStock: true,
        discounts: {
          where: {
            isActive: true,
            startDate: {
              lte: new Date()
            },
            endDate: {
              gte: new Date()
            }
          }
        }
      }
    });

    products.forEach(product => {
      console.log(`Product: ${product.title}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  inStock: ${product.inStock}`);
      console.log(`  Active discounts: ${product.discounts.length}`);
      console.log('---');
    });

    console.log('\nUpdating products to be in stock...');
    
    // Update all products to be in stock
    await prisma.product.updateMany({
      data: {
        inStock: true
      }
    });

    console.log('All products updated to be in stock');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductInventory();
