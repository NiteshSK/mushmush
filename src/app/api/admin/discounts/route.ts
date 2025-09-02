import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all discounts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const discounts = await prisma.productDiscount.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ discounts });
  } catch (error) {
    console.error('Discount fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new discount
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { productId, type, value, isActive, startDate, endDate } = await request.json();

    // Validation
    if (!productId || !type || value === undefined) {
      return NextResponse.json({ error: 'Product ID, type, and value are required' }, { status: 400 });
    }

    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json({ error: 'Percentage discount must be between 0 and 100' }, { status: 400 });
    }

    if (type === 'FIXED_AMOUNT' && value < 0) {
      return NextResponse.json({ error: 'Fixed amount discount cannot be negative' }, { status: 400 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if there's already an active discount for this product
    const existingDiscount = await prisma.productDiscount.findFirst({
      where: {
        productId: parseInt(productId),
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    });

    if (existingDiscount) {
      return NextResponse.json({ error: 'Product already has an active discount' }, { status: 409 });
    }

    const discount = await prisma.productDiscount.create({
      data: {
        productId: parseInt(productId),
        type: type,
        value: parseFloat(value),
        isActive: isActive !== false,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    });

    return NextResponse.json({ discount }, { status: 201 });
  } catch (error) {
    console.error('Discount creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
