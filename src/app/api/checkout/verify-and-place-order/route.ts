import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { otpStore } from '@/lib/otp-store';
import {
  checkClientTotal,
  priceOrder,
  pricingBreakdown,
  pricingErrorBody,
} from '@/lib/order-pricing';
import { createOrderPaymentToken, GUEST_USER_EMAIL, orderTrackingUrl } from '@/lib/order-access';

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
      // Only used to detect a mismatch with what the shopper saw. Browser
      // subtotal, shippingFee, convenienceFee and per-item price /
      // discountedPrice are ignored: all amounts come from priceOrder().
      total: clientTotal,
      couponCode
    } = body;

    // Validate required fields
    if (
      !otp ||
      typeof email !== 'string' ||
      !email ||
      !customerName ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check the OTP (hashed comparison with attempt tracking). It is used up
    // only when the order is created below, so a shopper who must accept a
    // corrected total (409 TOTAL_MISMATCH) can continue with the same code.
    const otpCheck = await otpStore.check(email.toLowerCase(), otp);

    if (otpCheck.valid === false) {
      return NextResponse.json(
        { error: otpCheck.error },
        { status: 400 }
      );
    }

    // For guest checkout, we need a userId. Create a guest user or use a default guest ID
    let userId = session?.user?.id;
    
    if (!userId) {
      // For guest checkout, create a temporary guest user or use a default guest ID
      // Option 1: Use a default "guest" user ID
      const guestUser = await prisma.user.findFirst({
        where: { email: GUEST_USER_EMAIL }
      });
      
      if (!guestUser) {
        // Create a default guest user if it doesn't exist
        const newGuestUser = await prisma.user.create({
          data: {
            id: 'guest-user',
            name: 'Guest User',
            email: GUEST_USER_EMAIL,
            role: 'CUSTOMER'
          }
        });
        userId = newGuestUser.id;
      } else {
        userId = guestUser.id;
      }
    }

    // Validate address data
    const hasAddressFields = (addr: any) =>
      Boolean(addr?.street && addr?.city && addr?.state && addr?.zip);

    if (!hasAddressFields(billingAddress) || (!shippingAddressId && !hasAddressFields(shippingAddress))) {
      return NextResponse.json(
        { error: 'Missing required address fields (street, city, state, zip)' },
        { status: 400 }
      );
    }

    // Saved addresses belong to the signed-in shopper. A guest, or another
    // account, cannot use an address ID to ship to or bill a stranger's address.
    const sessionUserId = session?.user?.id ?? null;
    const findOwnAddress = (id: unknown) =>
      sessionUserId && typeof id === 'string' && id
        ? prisma.addresses.findFirst({ where: { id, userId: sessionUserId } })
        : Promise.resolve(null);

    // Resolve the saved shipping address first: its pincode decides the shipping fee
    let savedShippingAddr = null;
    if (shippingAddressId) {
      savedShippingAddr = await findOwnAddress(shippingAddressId);

      if (!savedShippingAddr) {
        return NextResponse.json(
          { error: 'Selected shipping address not found' },
          { status: 400 }
        );
      }
    }

    let savedBillingAddr = null;
    if (billingAddressId) {
      savedBillingAddr = await findOwnAddress(billingAddressId);

      if (!savedBillingAddr) {
        return NextResponse.json(
          { error: 'Selected billing address not found' },
          { status: 400 }
        );
      }
    }

    // Authoritative server-side pricing (prices, discounts, stock, shipping,
    // convenience fee, coupon). Done before any address/order row is created.
    const pricingResult = await priceOrder({
      items: cartItems.map((item: any) => ({ productId: item?.id, quantity: item?.quantity })),
      pincode: savedShippingAddr ? savedShippingAddr.zip : shippingAddress.zip,
      couponCode,
      email,
    });

    if (pricingResult.ok === false) {
      return NextResponse.json(pricingErrorBody(pricingResult), { status: pricingResult.status });
    }
    const pricing = pricingResult.pricing;

    // The amount shown to the shopper must equal the amount charged
    const totalMismatch = checkClientTotal(clientTotal, pricing);
    if (totalMismatch) {
      return NextResponse.json(totalMismatch.body, { status: totalMismatch.status });
    }

    // The shopper accepted this total. Use up the OTP now; if a parallel
    // request already used it, stop before creating a second order.
    if (!(await otpStore.consume(otpCheck.id))) {
      return NextResponse.json(
        { error: 'This OTP has already been used. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Handle billing address - use the shopper's saved address if given (resolved above), otherwise create new
    let billingAddr;
    if (savedBillingAddr) {
      billingAddr = savedBillingAddr;
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
    if (savedShippingAddr) {
      // Use existing saved address (resolved above)
      shippingAddr = savedShippingAddr;
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
        subtotal: pricing.subtotal,
        tax: pricing.convenienceFee, // Convenience fee stored in tax field
        shipping: pricing.shippingFee,
        couponDiscount: pricing.couponDiscount,
        couponId: pricing.couponId,
        total: pricing.total,
        status: 'PENDING', // Awaiting payment — stock decremented on payment confirmation
        shippingAddress: shippingAddressJson, // JSON object for jsonb column
        billingAddressId: billingAddr.id,
        shippingAddressId: shippingAddr.id,
        userId: session?.user?.id || userId, // Use session user or guest user
        orderItems: {
          create: pricing.items.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            price: line.unitPrice // server price incl. active product discount
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
    if (pricing.couponId) {
      await prisma.$transaction([
        prisma.couponUsage.create({
          data: {
            couponId: pricing.couponId,
            email: email.toLowerCase(),
            orderId: order.id,
            discountAmount: pricing.couponDiscount,
          },
        }),
        prisma.coupon.update({
          where: { id: pricing.couponId },
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
        couponDiscount: pricing.couponDiscount || 0,
        productDiscount: productDiscount > 0 ? productDiscount : 0,
        total: order.total,
        shippingAddress: shippingAddressJson,
      };

      await Promise.allSettled([
        sendOrderPlacedEmail({ ...notificationData, trackingUrl: orderTrackingUrl(order) }),
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
      },
      // Proof for /api/checkout/upi-payment that this browser created the order
      paymentToken: createOrderPaymentToken(order.id),
      // Read-only link for guests to follow the order (relative; the email makes it absolute)
      trackingUrl: orderTrackingUrl(order),
      // Server breakdown; the UPI amount must be order.total
      pricing: pricingBreakdown(pricing)
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
