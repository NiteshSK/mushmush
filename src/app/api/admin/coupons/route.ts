import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — List all coupons
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Create new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      maxUses,
      maxUsesPerEmail,
      startDate,
      endDate,
    } = body;

    // Validation
    if (!code || !type || value === undefined || !endDate) {
      return NextResponse.json({ error: 'Missing required fields: code, type, value, endDate' }, { status: 400 });
    }

    if (!['PERCENTAGE', 'FIXED_AMOUNT'].includes(type)) {
      return NextResponse.json({ error: 'Type must be PERCENTAGE or FIXED_AMOUNT' }, { status: 400 });
    }

    if (type === 'PERCENTAGE' && (value <= 0 || value > 100)) {
      return NextResponse.json({ error: 'Percentage value must be between 1 and 100' }, { status: 400 });
    }

    if (type === 'FIXED_AMOUNT' && value <= 0) {
      return NextResponse.json({ error: 'Fixed amount must be greater than 0' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check for duplicate
    const existing = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        type,
        value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        maxUsesPerEmail: maxUsesPerEmail ? parseInt(maxUsesPerEmail) : 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
