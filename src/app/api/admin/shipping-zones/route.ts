import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.role === 'ADMIN';
}

// GET all shipping zones
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const zones = await prisma.shippingZone.findMany({
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json({ zones });
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping zones' }, { status: 500 });
  }
}

// POST create a new shipping zone
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, pincodeFrom, pincodeTo, baseFee, freeAbove, estimatedDays, isActive, priority } = body;

    if (!name || !pincodeFrom || !pincodeTo || baseFee === undefined) {
      return NextResponse.json({ error: 'Missing required fields: name, pincodeFrom, pincodeTo, baseFee' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(pincodeFrom) || !/^\d{6}$/.test(pincodeTo)) {
      return NextResponse.json({ error: 'Pincodes must be exactly 6 digits' }, { status: 400 });
    }

    if (pincodeFrom > pincodeTo) {
      return NextResponse.json({ error: 'pincodeFrom must be less than or equal to pincodeTo' }, { status: 400 });
    }

    const zone = await prisma.shippingZone.create({
      data: {
        name,
        pincodeFrom,
        pincodeTo,
        baseFee: parseFloat(baseFee),
        freeAbove: freeAbove !== null && freeAbove !== undefined ? parseFloat(freeAbove) : null,
        estimatedDays: estimatedDays || null,
        isActive: isActive ?? true,
        priority: priority ?? 0,
      },
    });

    return NextResponse.json({ zone }, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping zone:', error);
    return NextResponse.json({ error: 'Failed to create shipping zone' }, { status: 500 });
  }
}

// PUT update a shipping zone
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing zone id' }, { status: 400 });
    }

    if (data.pincodeFrom && !/^\d{6}$/.test(data.pincodeFrom)) {
      return NextResponse.json({ error: 'pincodeFrom must be exactly 6 digits' }, { status: 400 });
    }
    if (data.pincodeTo && !/^\d{6}$/.test(data.pincodeTo)) {
      return NextResponse.json({ error: 'pincodeTo must be exactly 6 digits' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.pincodeFrom !== undefined) updateData.pincodeFrom = data.pincodeFrom;
    if (data.pincodeTo !== undefined) updateData.pincodeTo = data.pincodeTo;
    if (data.baseFee !== undefined) updateData.baseFee = parseFloat(data.baseFee);
    if (data.freeAbove !== undefined) updateData.freeAbove = data.freeAbove !== null ? parseFloat(data.freeAbove) : null;
    if (data.estimatedDays !== undefined) updateData.estimatedDays = data.estimatedDays;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.priority !== undefined) updateData.priority = data.priority;

    const zone = await prisma.shippingZone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ zone });
  } catch (error) {
    console.error('Error updating shipping zone:', error);
    return NextResponse.json({ error: 'Failed to update shipping zone' }, { status: 500 });
  }
}

// DELETE a shipping zone
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json({ error: 'Missing zone id' }, { status: 400 });
    }

    await prisma.shippingZone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipping zone:', error);
    return NextResponse.json({ error: 'Failed to delete shipping zone' }, { status: 500 });
  }
}
