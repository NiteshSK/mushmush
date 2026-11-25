import { NextRequest, NextResponse } from 'next/server';
import { staffSession } from "@/lib/admin";
import { prisma } from '@/lib/prisma';
import { saveProductDiscount } from '@/lib/admin-product-discount';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return saveProductDiscount(request, Number((await params).id));
}

// DELETE - Remove discount
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await staffSession("editor");
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const discountId = parseInt(resolvedParams.id);

    await prisma.productDiscount.update({
      data: {isActive:false},
      where: { id: discountId }
    });

    return NextResponse.json({ message: 'Discount disabled' });
  } catch (error) {
    console.error('Discount deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
