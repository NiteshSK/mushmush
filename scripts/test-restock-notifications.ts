import { PrismaClient } from '@prisma/client';
import { sendRestockNotifications } from '../src/lib/notifications';

const prisma = new PrismaClient();

async function testRestockNotifications() {
  try {
    console.log('Testing restock notification system...\n');

    // Get all products that are out of stock
    const outOfStockProducts = await prisma.product.findMany({
      where: { inStock: false },
      select: {
        id: true,
        title: true,
        inStock: true,
        notifications: {
          where: { isActive: true },
          select: {
            id: true,
            email: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    });

    console.log(`Found ${outOfStockProducts.length} products out of stock:`);
    
    for (const product of outOfStockProducts) {
      console.log(`\nProduct: ${product.title} (ID: ${product.id})`);
      console.log(`  Status: ${product.inStock ? 'In Stock' : 'Out of Stock'}`);
      console.log(`  Active notifications: ${product.notifications.length}`);
      
      if (product.notifications.length > 0) {
        console.log('  Subscribers:');
        product.notifications.forEach(notification => {
          console.log(`    - ${notification.email} (subscribed: ${notification.createdAt})`);
        });
      }
    }

    // Test sending notifications for a specific product
    if (outOfStockProducts.length > 0) {
      const testProduct = outOfStockProducts[0];
      console.log(`\n--- Testing restock notifications for ${testProduct.title} ---`);
      
      // Temporarily set product to in stock to test notifications
      console.log('Setting product to in stock...');
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { inStock: true }
      });

      // Send notifications
      console.log('Sending restock notifications...');
      const result = await sendRestockNotifications(testProduct.id);
      console.log('Notification result:', result);

      // Reset product to out of stock
      console.log('Resetting product to out of stock...');
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { inStock: false }
      });

      console.log('Test completed!');
    } else {
      console.log('\nNo out-of-stock products found to test with.');
      console.log('To test the system:');
      console.log('1. Set a product to out of stock');
      console.log('2. Subscribe to notifications for that product');
      console.log('3. Run this script again');
    }

  } catch (error) {
    console.error('Error testing restock notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRestockNotifications();
