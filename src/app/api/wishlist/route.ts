import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            categories: {
              include: {
                category: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            },
            discounts: {
              where: {
                isActive: true,
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } }
                ]
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to include discount calculations
    const transformedItems = wishlistItems.map(item => {
      const product = item.product;
      const activeDiscount = product.discounts?.[0];
      
      let discountedPrice = product.price;
      let discountPercentage = 0;
      let hasDiscount = false;

      if (activeDiscount) {
        if (activeDiscount.type === 'PERCENTAGE') {
          discountPercentage = activeDiscount.value;
          discountedPrice = Math.round(product.price * (1 - activeDiscount.value / 100));
        } else if (activeDiscount.type === 'FIXED_AMOUNT') {
          discountedPrice = Math.max(0, product.price - activeDiscount.value);
          discountPercentage = Math.round(((product.price - discountedPrice) / product.price) * 100);
        }
        hasDiscount = true;
      }

      // Calculate average rating
      const averageRating = product.reviews?.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0;

      return {
        ...item,
        product: {
          ...product,
          discountedPrice,
          discountPercentage,
          hasDiscount,
          averageRating,
          reviewCount: product.reviews?.length || 0,
          reviews: product.reviews?.length || 0
        }
      };
    });

    console.log('GET - Wishlist items for user:', { 
      userId: user.id, 
      itemCount: wishlistItems.length,
      productIds: wishlistItems.map(item => item.product.id)
    });

    return NextResponse.json({ items: transformedItems });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: parseInt(productId)
        }
      }
    });

    if (existingItem) {
      return NextResponse.json({ error: 'Item already in wishlist' }, { status: 409 });
    }

    // Add to wishlist
    console.log('POST - Adding to wishlist:', { userId: user.id, productId: parseInt(productId) });
    
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: parseInt(productId)
      },
      include: {
        product: true
      }
    });

    console.log('POST - Successfully added:', wishlistItem.id);
    return NextResponse.json({ item: wishlistItem }, { status: 201 });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the wishlist item exists before deleting
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: parseInt(productId)
        }
      }
    });

    console.log('DELETE - Checking wishlist item:', { 
      userId: user.id, 
      productId: parseInt(productId), 
      existingItem: !!existingItem 
    });

    if (!existingItem) {
      console.log('DELETE - Item not found in wishlist');
      return NextResponse.json({ error: 'Item not found in wishlist' }, { status: 404 });
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId: parseInt(productId)
        }
      }
    });

    return NextResponse.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
