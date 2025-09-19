import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBenefitsData() {
  try {
    console.log('Checking products with benefits data...');
    
    // Find all products that have benefits data
    const productsWithBenefits = await prisma.product.findMany({
      where: {
        benefits: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        benefits: true
      }
    });
    
    console.log(`Found ${productsWithBenefits.length} products with benefits data:`);
    
    if (productsWithBenefits.length === 0) {
      console.log('No products have benefits data yet.');
      
      // Check total products count
      const totalProducts = await prisma.product.count();
      console.log(`Total products in database: ${totalProducts}`);
      
      // Get first product for testing
      const firstProduct = await prisma.product.findFirst({
        select: {
          id: true,
          title: true,
          benefits: true
        }
      });
      
      if (firstProduct) {
        console.log(`First product: ${firstProduct.title} (ID: ${firstProduct.id})`);
        console.log(`Benefits data: ${firstProduct.benefits}`);
      }
    } else {
      productsWithBenefits.forEach(product => {
        console.log(`- ${product.title} (ID: ${product.id})`);
        console.log(`  Benefits: ${product.benefits}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking benefits data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBenefitsData();
