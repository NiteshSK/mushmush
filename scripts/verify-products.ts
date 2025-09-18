import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyProducts() {
  try {
    console.log('🔍 Verifying product restoration...');

    // Get total product count
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total products in database: ${totalProducts}`);

    if (totalProducts === 0) {
      console.log('❌ No products found in database!');
      return;
    }

    // Get all products
    const products = await prisma.product.findMany({
      include: {
        categories: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`\n📦 Found ${products.length} products:`);

    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Measurement: ${product.measurementValue} ${product.measurementType}`);
      console.log(`   In Stock: ${product.inStock ? 'Yes' : 'No'}`);
      console.log(`   Featured: ${product.featured ? 'Yes' : 'No'}`);
      console.log(`   Categories: ${product.categories.map(pc => pc.category.title).join(', ') || 'None'}`);
      console.log(`   Images: ${product.imgs?.previews?.length || 0} previews, ${product.imgs?.thumbnails?.length || 0} thumbnails`);
      console.log(`   Specifications: ${product.specifications?.length || 0} items`);
      console.log(`   How to Consume: ${product.howToConsume?.length || 0} items`);
      console.log(`   Additional Info: ${product.additionalInfo?.length || 0} items`);
      console.log(`   Created: ${product.createdAt}`);
      console.log(`   Updated: ${product.updatedAt}`);
    });

    // Check for specific expected products
    const expectedProducts = [
      'Oyster Mushroom',
      "Lion's Mane",
      'Shitake',
      "Ganoderma's Tincture",
      'Chantrelle'
    ];

    console.log('\n✅ Checking for expected products:');
    expectedProducts.forEach(expectedName => {
      const found = products.find(p => p.title === expectedName);
      if (found) {
        console.log(`   ✓ ${expectedName} - Found (ID: ${found.id})`);
      } else {
        console.log(`   ✗ ${expectedName} - Missing`);
      }
    });

    // Check data integrity
    console.log('\n🔍 Checking data integrity:');
    let integrityIssues = 0;

    products.forEach(product => {
      // Check required fields
      if (!product.title || !product.slug || !product.description || !product.price) {
        console.log(`   ⚠️  Product ${product.id} (${product.title}) missing required fields`);
        integrityIssues++;
      }

      // Check measurement
      if (!product.measurementValue || !product.measurementType) {
        console.log(`   ⚠️  Product ${product.id} (${product.title}) has invalid measurement`);
        integrityIssues++;
      }

      // Check images
      if (!product.imgs || !product.imgs.previews || !product.imgs.thumbnails) {
        console.log(`   ⚠️  Product ${product.id} (${product.title}) has missing image data`);
        integrityIssues++;
      }
    });

    if (integrityIssues === 0) {
      console.log('   ✅ All products have valid data structure');
    } else {
      console.log(`   ❌ Found ${integrityIssues} data integrity issues`);
    }

    console.log('\n🎉 Product verification completed!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProducts();
