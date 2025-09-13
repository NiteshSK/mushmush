import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const active = searchParams.get('active') !== 'false';

    const now = new Date();
    
    const banners = await prisma.promotionalBanner.findMany({
      where: {
        isActive: active,
        startDate: {
          lte: now
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            imgs: true,
            inStock: true
          }
        },
        category: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: banners
    });

  } catch (error) {
    console.error('Error fetching promotional banners:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch promotional banners' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      subtitle,
      description,
      discount,
      buttonText = 'Buy Now',
      buttonLink,
      productId,
      categoryId,
      imageUrl,
      bgColor = '#F5F5F7',
      textColor = '#000000',
      isActive = true,
      startDate,
      endDate,
      priority = 0
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and image URL are required' 
        },
        { status: 400 }
      );
    }

    const banner = await prisma.promotionalBanner.create({
      data: {
        title,
        subtitle,
        description,
        discount,
        buttonText,
        buttonLink,
        productId: productId ? parseInt(productId) : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        imageUrl,
        bgColor,
        textColor,
        isActive,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        priority
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        category: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: banner
    });

  } catch (error) {
    console.error('Error creating promotional banner:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create promotional banner' 
      },
      { status: 500 }
    );
  }
}
