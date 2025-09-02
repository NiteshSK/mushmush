import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update discount
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const discountId = parseInt(resolvedParams.id);
    const { type, value, isActive, startDate, endDate } = await request.json();

    // Validation
    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json({ error: 'Percentage discount must be between 0 and 100' }, { status: 400 });
    }

    if (type === 'FIXED_AMOUNT' && value < 0) {
      return NextResponse.json({ error: 'Fixed amount discount cannot be negative' }, { status: 400 });
    }

    const discount = await prisma.productDiscount.update({
      where: { id: discountId },
      data: {
        type: type,
        value: parseFloat(value),
        isActive: isActive !== false,
        startDate: startDate ? new Date(startDate) : undefined,
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

    return NextResponse.json({ discount });
  } catch (error) {
    console.error('Discount update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove discount
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const discountId = parseInt(resolvedParams.id);

    await prisma.productDiscount.delete({
      where: { id: discountId }
    });

    return NextResponse.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Discount deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
