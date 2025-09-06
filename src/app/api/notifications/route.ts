import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const notificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  productId: z.number().int().positive('Invalid product ID'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productId } = notificationSchema.parse(body);

    // Check if product exists and is out of stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.inStock) {
      return NextResponse.json(
        { error: 'Product is currently in stock' },
        { status: 400 }
      );
    }

    // Create or update notification subscription
    const notification = await prisma.productNotification.upsert({
      where: {
        email_productId: {
          email,
          productId
        }
      },
      update: {
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        email,
        productId,
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Successfully subscribed to product notifications',
      notificationId: notification.id
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Notification subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const productId = searchParams.get('productId');

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Email and productId are required' },
        { status: 400 }
      );
    }

    await prisma.productNotification.updateMany({
      where: {
        email,
        productId: parseInt(productId),
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Successfully unsubscribed from notifications'
    });

  } catch (error) {
    console.error('Notification unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
