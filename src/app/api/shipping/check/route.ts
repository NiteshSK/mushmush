import { isFreshMushroom } from "@/components/Pantry/catalogue";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import {
  BASE_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  calculateShippingFee,
  findShippingZone,
  freshDeliveryPins,
  isValidPincode,
} from '@/lib/shipping';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!Number.isFinite(subtotal) || subtotal < 0) return NextResponse.json({ error: "Invalid subtotal." }, { status: 400 });
    if (!isValidPincode(pincode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit pincode' },
        { status: 400 }
      );
    }

    const item = searchParams.get("productId");
    const productId = item === null ? undefined : Number(item);
    if (productId !== undefined && (!Number.isInteger(productId) || productId < 1 || productId > 2147483647)) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }

    // Find matching shipping zone (pincode falls within range, highest priority first)
    const zone = await findShippingZone(pincode);

    if (!zone) {
      return NextResponse.json({
        deliverable: false,
        message: 'Sorry, we do not deliver to this pincode yet.',
        pincode,
      });
    }

    const [pins, product] = await Promise.all([
      freshDeliveryPins(),
      productId === undefined ? null : prisma.product.findFirst({
        where: { id: productId, archivedAt: null },
        select: {
          title: true, measurementType: true, measurementValue: true, fulfillmentClass: true,
          categories: { select: { category: { select: { slug: true } } } },
        },
      }),
    ]);
    const freshEligible = pins.includes(pincode);
    if (productId !== undefined && !product) {
      return NextResponse.json({ deliverable: false, pincode, message: "This product is no longer available." });
    }
    if (product && isFreshMushroom(product) && !freshEligible) {
      return NextResponse.json({ deliverable: false, freshEligible, pincode, message: "Fresh mushrooms deliver only to approved Dehradun PINs. Dried mushrooms and pantry foods ship across India." });
    }

    // Same rule the order pricing uses (src/lib/shipping.ts):
    // free at or above ₹1999, else base ₹50 + zone's extra fee
    const { shippingFee: totalShippingFee, freeShipping: isFreeShipping } =
      calculateShippingFee(zone.baseFee, subtotal);

    return NextResponse.json({
      deliverable: true,
      pincode,
      zoneName: zone.name,
      freshEligible,
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
