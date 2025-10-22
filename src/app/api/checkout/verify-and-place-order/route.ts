import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { otpStore } from '@/lib/otp-store';

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
      total,
      paymentMethod,
      notes
    } = body;

    // Validate required fields
    if (!otp || !email || !customerName || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify OTP
    const storedOTP = await otpStore.get(email.toLowerCase());
    
    if (!storedOTP) {
      return NextResponse.json(
        { error: 'OTP not found or expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (storedOTP.expiresAt < Date.now()) {
      await otpStore.delete(email.toLowerCase());
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (storedOTP.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // OTP is valid, delete it
    await otpStore.delete(email.toLowerCase());

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
      console.log('✅ Using existing billing address:', billingAddressId);
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
      console.log('✅ Created new billing address');
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
      console.log('✅ Using existing shipping address:', shippingAddressId);
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
      console.log('✅ Created new shipping address');
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

    console.log('📦 Creating order with data:', {
      orderNumber,
      customerName,
      email,
      customerPhone,
      shippingAddress: shippingAddressJson,
      billingAddressId: billingAddr.id,
      shippingAddressId: shippingAddr.id,
      userId: session?.user?.id || userId,
      itemCount: cartItems.length
    });

    // Create order
    // COD orders are CONFIRMED immediately since payment is collected on delivery
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail: email,
        customerPhone: customerPhone || '',
        subtotal,
        tax: 0, // Add tax calculation if needed
        shipping: shippingFee,
        total,
        status: 'CONFIRMED', // COD orders are confirmed immediately
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

    console.log('✅ Order created successfully:', orderNumber);

    // Generate invoice and send email for CONFIRMED orders
    try {
      console.log('🔄 Generating invoice for order...');
      
      const { generateInvoice, markInvoiceEmailSent } = await import('@/lib/invoice');
      const { sendOrderInvoiceEmail } = await import('@/lib/email');
      
      // Generate invoice
      const invoice = await generateInvoice(order.id);
      console.log('✅ Invoice generated:', invoice.invoiceNumber);
      
      // Prepare email data
      const emailData = {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        invoiceNumber: invoice.invoiceNumber,
        invoicePdfUrl: invoice.pdfPath || '',
        orderDate: order.createdAt,
        orderItems: order.orderItems.map(item => ({
          productTitle: item.product.title,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: {
          address: shippingAddr.street,
          city: shippingAddr.city,
          state: shippingAddr.state,
          zipCode: shippingAddr.zip,
          country: shippingAddr.country
        }
      };
      
      // Send email
      console.log('📧 Sending invoice email...');
      await sendOrderInvoiceEmail(emailData);
      
      // Mark email as sent
      await markInvoiceEmailSent(invoice.id);
      console.log('✅ Invoice email sent successfully');
      
    } catch (invoiceError) {
      console.error('❌ Error generating invoice or sending email:', invoiceError);
      // Don't fail the order if invoice/email fails
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
    console.error('Error placing order:', error);
    return NextResponse.json(
      { error: 'Failed to place order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
