import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').slice(0, 200);
    const category = (searchParams.get('category') || '').slice(0, 100);
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      AND: [
        {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      ],
    };

    // Add search query filter
    if (query.trim()) {
      where.AND.push({
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    // Add category filter - handle both ID and name
    if (category && category !== '0') {
      // First try as category name directly
      where.AND.push({
        categories: {
          some: {
            category: {
              title: {
                contains: category,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Products added within the last 14 days are automatically tagged "New"
    const newThreshold = new Date();
    newThreshold.setDate(newThreshold.getDate() - 14);

    const enrichedProducts = products.map(product => ({
      ...product,
      isNew: product.createdAt >= newThreshold,
    }));

    return NextResponse.json({
      products: enrichedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search products error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
