import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH — Update coupon
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const updateData: any = {};
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = parseFloat(body.value);
    if (body.minOrderValue !== undefined) updateData.minOrderValue = body.minOrderValue ? parseFloat(body.minOrderValue) : null;
    if (body.maxDiscount !== undefined) updateData.maxDiscount = body.maxDiscount ? parseFloat(body.maxDiscount) : null;
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses ? parseInt(body.maxUses) : null;
    if (body.maxUsesPerEmail !== undefined) updateData.maxUsesPerEmail = parseInt(body.maxUsesPerEmail);
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const coupon = await prisma.coupon.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE — Delete coupon
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.coupon.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
