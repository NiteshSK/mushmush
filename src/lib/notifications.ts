import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { Product } from '@/types/product';

export async function sendRestockNotifications(productId: number) {
  try {
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        slug: true,
        imgs: true,
        inStock: true
      }
    }) as {
      id: number;
      title: string;
      slug: string;
      imgs: Product['imgs'];
      inStock: boolean;
    } | null;

    if (!product || !product.inStock) {
      console.log(`Product ${productId} not found or not in stock`);
      return { success: false, message: 'Product not found or not in stock' };
    }

    // Get all active notifications for this product
    const notifications = await prisma.productNotification.findMany({
      where: {
        productId,
        isActive: true
      }
    });

    if (notifications.length === 0) {
      console.log(`No active notifications found for product ${productId}`);
      return { success: true, message: 'No notifications to send' };
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const productUrl = `${baseUrl}/shop-details?id=${product.id}`;
    const productImage = (product.imgs as Product['imgs'])?.previews?.[0] || `${baseUrl}/images/placeholder.jpg`;

    // Send emails to all subscribers
    const emailPromises = notifications.map(async (notification) => {
      const template = emailTemplates.restockNotification(
        product.title,
        productUrl,
        productImage
      );

      const result = await sendEmail({
        to: notification.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      if (result.success) {
        // Deactivate the notification after sending
        await prisma.productNotification.update({
          where: { id: notification.id },
          data: { 
            isActive: false,
            updatedAt: new Date()
          }
        });
      }

      return {
        email: notification.email,
        success: result.success,
        error: result.error
      };
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Restock notifications sent for product ${productId}: ${successCount} successful, ${failureCount} failed`);

    return {
      success: true,
      message: `Sent ${successCount} notifications, ${failureCount} failed`,
      results
    };

  } catch (error) {
    console.error('Error sending restock notifications:', error);
    return {
      success: false,
      message: 'Failed to send notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function triggerRestockNotifications(productId: number) {
  // This function can be called when a product's stock is updated
  // It checks if the product went from out-of-stock to in-stock
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { inStock: true }
    });

    if (product?.inStock) {
      return await sendRestockNotifications(productId);
    }

    return { success: false, message: 'Product is not in stock' };
  } catch (error) {
    console.error('Error triggering restock notifications:', error);
    return {
      success: false,
      message: 'Failed to trigger notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
