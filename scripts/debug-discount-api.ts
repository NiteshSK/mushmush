import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugDiscountAPI() {
  try {
    console.log('🔍 Debugging discount API data...\n');
    
    // Simulate the same query as the products API
    const products = await prisma.product.findMany({
      include: {
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
        },
        reviews: true
      }
    });

    console.log('📦 Products with their discount data:\n');

    products.forEach(product => {
      console.log(`Product: ${product.title}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  inStock: ${product.inStock}`);
      console.log(`  Price: ₹${product.price}`);
      console.log(`  Active discounts: ${product.discounts.length}`);
      
      if (product.discounts.length > 0) {
        const activeDiscount = product.discounts[0];
        console.log(`  Discount type: ${activeDiscount.type}`);
        console.log(`  Discount value: ${activeDiscount.value}`);
        
        let discountedPrice = null;
        let discountPercentage = 0;
        
        if (activeDiscount.type === 'PERCENTAGE') {
          discountedPrice = Math.ceil(product.price * (1 - activeDiscount.value / 100));
          discountPercentage = activeDiscount.value;
        } else if (activeDiscount.type === 'FIXED_AMOUNT') {
          discountedPrice = Math.ceil(Math.max(0, product.price - activeDiscount.value));
          discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
        }
        
        console.log(`  Calculated discounted price: ₹${discountedPrice}`);
        console.log(`  Calculated discount percentage: ${Math.round(discountPercentage)}%`);
        console.log(`  hasDiscount: ${discountedPrice !== null}`);
      } else {
        console.log(`  hasDiscount: false`);
      }
      
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDiscountAPI();
