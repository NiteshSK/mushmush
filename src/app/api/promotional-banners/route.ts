import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(30,Math.max(1, Number(searchParams.get('limit')) || 5));

    const now = new Date();
    
    const banners = await prisma.promotionalBanner.findMany({
      where: {
        isActive: true,
        AND: [{ OR: [{productId:null}, {product: {archivedAt:null}}] }],
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

export { POST } from "../admin/promotional-banners/route";
