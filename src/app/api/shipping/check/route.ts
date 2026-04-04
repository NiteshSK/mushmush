import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BASE_SHIPPING_FEE = 50; // ₹50 minimum on every order
const FREE_SHIPPING_THRESHOLD = 1999; // Free shipping only above ₹1999

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit pincode' },
        { status: 400 }
      );
    }

    // Find matching shipping zone (pincode falls within range, highest priority first)
    const zone = await prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        pincodeFrom: { lte: pincode },
        pincodeTo: { gte: pincode },
      },
      orderBy: { priority: 'desc' },
    });

    if (!zone) {
      return NextResponse.json({
        deliverable: false,
        message: 'Sorry, we do not deliver to this pincode yet.',
        pincode,
      });
    }

    // Free shipping only if subtotal >= ₹1999
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    // Total shipping = base ₹50 + zone's extra fee (baseFee in DB is the extra on top)
    const totalShippingFee = isFreeShipping ? 0 : BASE_SHIPPING_FEE + zone.baseFee;

    return NextResponse.json({
      deliverable: true,
      pincode,
      zoneName: zone.name,
      shippingFee: totalShippingFee,
      baseFee: BASE_SHIPPING_FEE,
      zoneFee: zone.baseFee,
      estimatedDays: zone.estimatedDays,
      freeShipping: isFreeShipping,
      freeAbove: FREE_SHIPPING_THRESHOLD,
      message: isFreeShipping
        ? 'Free Delivery applied!'
        : subtotal > 0
          ? `Delivery: ₹${totalShippingFee}. Free Delivery on orders above ₹${FREE_SHIPPING_THRESHOLD}!`
          : `Delivery: ₹${totalShippingFee}`,
    });
  } catch (error) {
    console.error('Shipping check error:', error);
    return NextResponse.json(
      { error: 'Failed to check shipping. Please try again.' },
      { status: 500 }
    );
  }
}
