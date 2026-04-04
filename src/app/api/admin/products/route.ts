import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { availablePacks, formatBulkQuantity } from '@/lib/inventory';

// GET - Fetch all products for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        discounts: {
          where: {
            isActive: true,
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        },
        reviews: true,
        categories: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const productsWithStats = products.map(product => ({
      ...product,
      stockQuantity: availablePacks(product.quantity, product.measurementValue, product.measurementType),
      bulkQuantity: product.quantity,
      bulkDisplay: formatBulkQuantity(product.quantity, product.measurementType),
      reviewCount: product.reviews.length,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      hasActiveDiscount: product.discounts.length > 0,
      activeDiscountValue: product.discounts[0]?.value || 0,
      categoryNames: product.categories.map(pc => pc.category.title)
    }));

    return NextResponse.json(productsWithStats);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update product stock status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, inStock } = await request.json();

    if (!productId || typeof inStock !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { inStock },
      include: {
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: `Product ${inStock ? 'marked as in stock' : 'marked as out of stock'}`
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
