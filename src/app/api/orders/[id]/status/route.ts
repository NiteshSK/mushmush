import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoice, markInvoiceEmailSent } from '@/lib/invoice';
import { sendOrderInvoiceEmail, OrderInvoiceEmailData } from '@/lib/email';
import { packsToBulk } from '@/lib/inventory';

/**
 * PUT /api/orders/[id]/status
 * Update order status and trigger invoice generation when status becomes COMPLETED
 * Admin only
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'PAYMENT_RECEIVED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status value: ${status}. Valid statuses are: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if we need to restore stock (cancelling a confirmed/processing order)
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    const stockWasDeducted = ['PAYMENT_RECEIVED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(currentOrder?.status || '');
    const isCancelling = status === 'CANCELLED';

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                measurementValue: true,
                measurementType: true,
              }
            }
          }
        }
      }
    });


    // Restore stock if cancelling an order whose stock was already deducted
    if (isCancelling && stockWasDeducted) {
      for (const item of order.orderItems) {
        const bulkToRestore = packsToBulk(item.quantity, item.product.measurementValue, item.product.measurementType);
        await prisma.product.update({
          where: { id: item.product.id },
          data: {
            quantity: { increment: bulkToRestore },
            inStock: true,
          },
        });
      }
    }

    // Fire emails in background — don't block the API response
    const sendEmails = async () => {
      try {
        const { sendOrderStatusEmail, sendEmail, getOrderEmails } = await import('@/lib/email');
        // Fetch shipping address for email
        let shippingAddr: any = null;
        if (order.shippingAddressId) {
          const addr = await prisma.addresses.findUnique({ where: { id: order.shippingAddressId } });
          if (addr) shippingAddr = { street: addr.street, city: addr.city, state: addr.state, zip: addr.zip };
        }

        await sendOrderStatusEmail({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          orderNumber: order.orderNumber,
          status,
          total: order.total,
          subtotal: order.subtotal,
          shipping: order.shipping,
          couponDiscount: order.couponDiscount,
          orderItems: order.orderItems.map(item => ({
            productTitle: item.product.title,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
          })),
          shippingAddress: shippingAddr,
        });
        // Also notify admin/order team with full details
        const orderRecipients = getOrderEmails();
        if (orderRecipients.length > 0) {
          const itemsHtml = order.orderItems.map((item: any) =>
            `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.product.title}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price.toFixed(2)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${(item.quantity * item.price).toFixed(2)}</td></tr>`
          ).join('');

          await sendEmail({
            to: orderRecipients,
            subject: `Order #${order.orderNumber} → ${status} — ₹${order.total.toFixed(2)}`,
            html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;">
              <div style="background:#1e40af;padding:24px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:18px;">Order Status: ${status}</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">#${order.orderNumber}</p>
              </div>
              <div style="padding:24px;background:white;">
                <div style="padding:12px;background:#eff6ff;border-radius:8px;margin-bottom:16px;">
                  <p style="margin:0;font-size:13px;"><strong>Customer:</strong> ${order.customerName}</p>
                  <p style="margin:4px 0 0;font-size:13px;"><strong>Email:</strong> ${order.customerEmail}</p>
                  ${order.customerPhone ? `<p style="margin:4px 0 0;font-size:13px;"><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
                </div>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                  <thead><tr style="background:#f3f4f6;"><th style="padding:8px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;">Item</th><th style="padding:8px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;">Qty</th><th style="padding:8px;text-align:right;font-size:11px;text-transform:uppercase;color:#6b7280;">Price</th><th style="padding:8px;text-align:right;font-size:11px;text-transform:uppercase;color:#6b7280;">Total</th></tr></thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <div style="text-align:right;font-size:13px;">
                  <p style="margin:3px 0;color:#6b7280;">Subtotal: ₹${order.subtotal.toFixed(2)}</p>
                  <p style="margin:3px 0;color:#6b7280;">Shipping: ${order.shipping === 0 ? 'FREE' : '₹' + order.shipping.toFixed(2)}</p>
                  ${order.couponDiscount > 0 ? `<p style="margin:3px 0;color:#059669;">Coupon: -₹${order.couponDiscount.toFixed(2)}</p>` : ''}
                  <p style="margin:6px 0 0;font-size:16px;font-weight:bold;color:#111;">Total: ₹${order.total.toFixed(2)}</p>
                </div>
                ${shippingAddr ? `<div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px;"><p style="margin:0;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;">Delivery Address</p><p style="margin:4px 0 0;color:#374151;font-size:13px;">${[shippingAddr.street, shippingAddr.city, shippingAddr.state, shippingAddr.zip].filter(Boolean).join(', ')}</p></div>` : ''}
              </div>
              <div style="padding:16px;text-align:center;color:#9ca3af;font-size:11px;">&copy; ${new Date().getFullYear()} Kosvana</div>
            </div>`,
          });
        }
      } catch (emailErr) {
        console.error('Email send error (non-blocking):', emailErr);
      }
    };

    // Fire invoice + email in background for COMPLETED status
    const sendInvoice = async () => {
      try {
        const invoice = await generateInvoice(order.id);

        let shippingAddressForEmail: any = { address: 'N/A', city: 'N/A', state: 'N/A', zipCode: 'N/A', country: 'India' };
        if (order.shippingAddressId) {
          const addr = await prisma.addresses.findUnique({ where: { id: order.shippingAddressId } });
          if (addr) {
            shippingAddressForEmail = { address: addr.street, city: addr.city, state: addr.state, zipCode: addr.zip, country: addr.country };
          }
        }

        let couponCode: string | null = null;
        if (order.couponId) {
          const coupon = await prisma.coupon.findUnique({ where: { id: order.couponId }, select: { code: true } });
          couponCode = coupon?.code || null;
        }

        const emailData: OrderInvoiceEmailData = {
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
          couponDiscount: order.couponDiscount,
          couponCode,
          total: order.total,
          shippingAddress: shippingAddressForEmail
        };

        await sendOrderInvoiceEmail(emailData);
        await markInvoiceEmailSent(invoice.id);
      } catch (invoiceErr) {
        console.error('Invoice/email error (non-blocking):', invoiceErr);
      }
    };

    // Don't await — let them run in the background
    sendEmails();
    if (['CONFIRMED', 'DELIVERED', 'COMPLETED'].includes(status)) {
      // Only send invoice if payment has been verified
      prisma.upi_payments.findFirst({
        where: { orderId: order.id, status: 'VERIFIED' },
      }).then(verifiedPayment => {
        if (verifiedPayment) {
          sendInvoice();
        } else {
          console.warn(`Skipping invoice for order ${order.orderNumber}: payment not verified`);
        }
      }).catch(err => {
        console.error('Payment verification check error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
