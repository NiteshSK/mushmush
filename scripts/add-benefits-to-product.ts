import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBenefitsToProduct() {
  try {
    console.log('Connecting to database...');
    
    // Find the first product to add benefits to
    const product = await prisma.product.findFirst();
    
    if (!product) {
      console.log('No products found in the database');
      return;
    }

    console.log('Found product:', product.title);
    console.log('Product ID:', product.id);
    console.log('Current benefits:', product.benefits);

    // Sample benefits data
    const benefitsData = {
      immuneSupport: "Boosts immune system function and helps fight off infections",
      energyBoost: "Provides natural energy enhancement and reduces fatigue",
      stressRelief: "Helps manage stress and promotes mental well-being",
      antiInflammatory: "Contains anti-inflammatory properties that support joint health",
      antioxidant: "Rich in antioxidants that protect cells from damage"
    };

    console.log('Benefits data to add:', benefitsData);

    // Convert to JSON string
    const benefitsJson = JSON.stringify(benefitsData);
    console.log('Benefits JSON string:', benefitsJson);

    // Update the product with benefits
    console.log('Updating product...');
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        benefits: benefitsJson
      }
    });

    console.log('Successfully updated product with benefits!');
    console.log('Updated product title:', updatedProduct.title);
    console.log('Updated benefits:', updatedProduct.benefits);

  } catch (error) {
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

addBenefitsToProduct();
