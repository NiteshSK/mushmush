import { NextRequest, NextResponse } from 'next/server';
import { staffSession } from "@/lib/admin";
import { prisma } from '@/lib/prisma';
import { saveProductDiscount } from '@/lib/admin-product-discount';

// GET - Fetch all discounts
export async function GET() {
  try {
    const session = await staffSession("editor");
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

export async function POST(request: NextRequest) {
  return saveProductDiscount(request);
}
