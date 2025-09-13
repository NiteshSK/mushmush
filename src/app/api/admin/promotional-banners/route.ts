import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'active', 'inactive', or null for all
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status === 'active') {
      const now = new Date();
      where.isActive = true;
      where.startDate = { lte: now };
      where.OR = [
        { endDate: null },
        { endDate: { gte: now } }
      ];
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [banners, total] = await Promise.all([
      prisma.promotionalBanner.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
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
        skip,
        take: limit
      }),
      prisma.promotionalBanner.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: banners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching promotional banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promotional banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

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
        { success: false, error: 'Title and image URL are required' },
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
      { success: false, error: 'Failed to create promotional banner' },
      { status: 500 }
    );
  }
}
