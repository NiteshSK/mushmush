import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { otpStore } from '@/lib/otp-store';
import { availablePacks } from '@/lib/inventory';
import { validateCoupon } from '@/lib/coupon';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      otp,
      email,
      customerName,
      customerPhone,
      billingAddress,
      shippingAddress,
      billingAddressId,
      shippingAddressId,
      cartItems,
      subtotal,
      shippingFee,
      convenienceFee,
      total,
      paymentMethod,
      notes,
      couponCode
    } = body;

    // Validate required fields
    if (!otp || !email || !customerName || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify OTP — hashed comparison with attempt tracking
    const otpResult = await otpStore.verify(email.toLowerCase(), otp);

    if (!otpResult.valid) {
      return NextResponse.json(
        { error: otpResult.error },
        { status: 400 }
      );
    }

    // For guest checkout, we need a userId. Create a guest user or use a default guest ID
    let userId = session?.user?.id;
    
    if (!userId) {
      // For guest checkout, create a temporary guest user or use a default guest ID
      // Option 1: Use a default "guest" user ID
      const guestUser = await prisma.user.findFirst({
        where: { email: 'guest@mushmush.in' }
      });
      
      if (!guestUser) {
        // Create a default guest user if it doesn't exist
        const newGuestUser = await prisma.user.create({
          data: {
            id: 'guest-user',
            name: 'Guest User',
            email: 'guest@mushmush.in',
            role: 'CUSTOMER'
          }
        });
        userId = newGuestUser.id;
      } else {
        userId = guestUser.id;
      }
    }

    // Validate address data
    if (!billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zip) {
      return NextResponse.json(
        { error: 'Missing required address fields (street, city, state, zip)' },
        { status: 400 }
      );
    }

    // Handle billing address - use existing if ID provided, otherwise create new (UPDATED)
    let billingAddr;
    if (billingAddressId) {
      // Use existing saved address (prevents duplicates) (UPDATED)
      billingAddr = await prisma.addresses.findUnique({
        where: { id: billingAddressId }
      });
      
      if (!billingAddr) {
        return NextResponse.json(
          { error: 'Selected billing address not found' },
          { status: 400 }
        );
      }
    } else {
      // Create new billing address
      billingAddr = await prisma.addresses.create({
        data: {
          id: `billing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          street: billingAddress.street,
          city: billingAddress.city,
          state: billingAddress.state,
          zip: billingAddress.zip,
          country: billingAddress.country || 'India',
          type: 'BILLING',
          isDefault: false,
          updatedAt: new Date(),
          userId: userId
        }
      });
    }

    // Handle shipping address - use existing if ID provided, otherwise create new
    let shippingAddr;
    if (shippingAddressId) {
      // Use existing saved address
      shippingAddr = await prisma.addresses.findUnique({
        where: { id: shippingAddressId }
      });
      
      if (!shippingAddr) {
        return NextResponse.json(
          { error: 'Selected shipping address not found' },
          { status: 400 }
        );
      }
    } else {
      // Create new shipping address
      shippingAddr = await prisma.addresses.create({
        data: {
          id: `shipping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country || 'India',
          type: 'SHIPPING',
          isDefault: false,
          updatedAt: new Date(),
          userId: userId
        }
      });
    }

    // Validate stock availability for all cart items
    const productIds = cartItems.map((item: any) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, quantity: true, inStock: true, measurementValue: true, measurementType: true }
    });

    const stockErrors: string[] = [];
    for (const cartItem of cartItems) {
      const product = products.find((p: any) => p.id === cartItem.id);
      if (!product) {
        stockErrors.push(`Product not found: ID ${cartItem.id}`);
        continue;
      }
      const packs = availablePacks(product.quantity, product.measurementValue, product.measurementType);
      if (!product.inStock || packs <= 0) {
        stockErrors.push(`"${product.title}" is out of stock`);
      } else if (cartItem.quantity > packs) {
        stockErrors.push(`"${product.title}" only has ${packs} unit(s) available`);
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        { error: 'Some items are unavailable', stockErrors },
        { status: 409 }
      );
    }

    // Validate and calculate coupon discount server-side
    let couponDiscount = 0;
    let couponId: number | null = null;

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal, email);
      if (!couponResult.valid) {
        return NextResponse.json(
          { error: `Coupon error: ${couponResult.message}` },
          { status: 400 }
        );
      }
      couponDiscount = couponResult.discountAmount!;
      couponId = couponResult.couponId!;
    }

    // Recalculate total server-side (never trust client total)
    const serverTotal = subtotal + (shippingFee ?? 0) + (convenienceFee ?? 12) - couponDiscount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Format shipping address as JSON object (production DB expects jsonb)
    const shippingAddressJson = {
      street: shippingAddr.street || '',
      city: shippingAddr.city || '',
      state: shippingAddr.state || '',
      zip: shippingAddr.zip || '',
      country: shippingAddr.country || 'India'
    };

    // Create order
    // COD orders are CONFIRMED immediately since payment is collected on delivery
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail: email,
        customerPhone: customerPhone || '',
        subtotal,
        tax: convenienceFee || 12, // Convenience fee stored in tax field
        shipping: shippingFee,
        couponDiscount,
        couponId,
        total: serverTotal,
        status: 'PENDING', // Awaiting payment — stock decremented on payment confirmation
        shippingAddress: shippingAddressJson, // JSON object for jsonb column
        billingAddressId: billingAddr.id,
        shippingAddressId: shippingAddr.id,
        userId: session?.user?.id || userId, // Use session user or guest user
        orderItems: {
          create: cartItems.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.discountedPrice || item.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Record coupon usage atomically
    if (couponId) {
      await prisma.$transaction([
        prisma.couponUsage.create({
          data: {
            couponId,
            email: email.toLowerCase(),
            orderId: order.id,
            discountAmount: couponDiscount,
          },
        }),
        prisma.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        }),
      ]);
    }

    // Stock is NOT decremented here — it happens after payment confirmation
    // Invoice is NOT sent here — it's sent after payment is verified (in order status change)

    // Send order placed email to customer + admin notification
    try {
      const { sendOrderPlacedEmail, sendAdminNewOrderEmail } = await import('@/lib/email');

      // Calculate product-level discount (original price vs discounted price)
      const orderItemsWithOriginal = order.orderItems.map((item: any) => ({
        productTitle: item.product.title,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.product.price,
        total: item.quantity * item.price,
      }));
      const productDiscount = orderItemsWithOriginal.reduce(
        (sum: number, item: any) => sum + ((item.originalPrice - item.price) * item.quantity), 0
      );

      const notificationData = {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: customerPhone || '',
        orderNumber: order.orderNumber,
        orderItems: orderItemsWithOriginal,
        subtotal: order.subtotal,
        shipping: order.shipping,
        couponDiscount: couponDiscount || 0,
        productDiscount: productDiscount > 0 ? productDiscount : 0,
        total: order.total,
        shippingAddress: shippingAddressJson,
      };

      await Promise.allSettled([
        sendOrderPlacedEmail(notificationData),
        sendAdminNewOrderEmail(notificationData),
      ]);
    } catch {
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
