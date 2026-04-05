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
        await sendOrderStatusEmail({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          orderNumber: order.orderNumber,
          status,
          total: order.total,
        });
        const orderRecipients = getOrderEmails();
        if (orderRecipients.length > 0) {
          await sendEmail({
            to: orderRecipients,
            subject: `Order ${order.orderNumber} — Status changed to ${status}`,
            html: `<div style="font-family:sans-serif;max-width:500px">
              <h2 style="color:#5c8e61">Order Status Update</h2>
              <p><strong>Order:</strong> ${order.orderNumber}</p>
              <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
              <p><strong>New Status:</strong> ${status}</p>
              <p><strong>Total:</strong> Rs. ${order.total.toFixed(2)}</p>
              <p style="color:#888;font-size:12px;margin-top:20px">This is an automated notification from Kosvana admin.</p>
            </div>`,
            text: `Order ${order.orderNumber} status changed to ${status}. Customer: ${order.customerName}. Total: Rs. ${order.total.toFixed(2)}`,
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
    if (status === 'COMPLETED') {
      sendInvoice();
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
