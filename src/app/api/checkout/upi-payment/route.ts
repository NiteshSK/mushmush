import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { decrementStockAtomic } from '@/lib/inventory';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();
    
    const orderNumber = formData.get('orderNumber') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const upiTransactionId = formData.get('upiTransactionId') as string;
    const upiId = formData.get('upiId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const customerEmail = formData.get('customerEmail') as string;
    const paymentProof = formData.get('paymentProof') as File | null;

    // Validate required fields
    if (!orderNumber || !upiTransactionId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists for this order
    const existingPayment = await prisma.upi_payments.findFirst({
      where: { orderId: order.id }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already submitted for this order' },
        { status: 400 }
      );
    }

    // Validate amount matches order total
    if (Math.abs(amount - order.total) > 0.01) {
      return NextResponse.json(
        { error: 'Payment amount does not match order total' },
        { status: 400 }
      );
    }

    // Check for duplicate transaction ID
    const duplicateTransaction = await prisma.upi_payments.findFirst({
      where: { transactionId: upiTransactionId }
    });

    if (duplicateTransaction) {
      return NextResponse.json(
        { error: 'This transaction ID has already been used. Please check your payment history.' },
        { status: 400 }
      );
    }

    // Handle payment proof upload if provided
    let paymentProofPath = null;
    if (paymentProof) {
      try {
        const bytes = await paymentProof.arrayBuffer();
        const uint8Array = new Uint8Array(bytes);
        
        // Create unique filename with validated extension
        const timestamp = Date.now();
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
        const rawExt = (paymentProof.name.split('.').pop() || '').toLowerCase();
        const ext = allowedExtensions.includes(rawExt) ? rawExt : 'bin';
        const safeOrderNumber = (orderNumber || 'unknown').replace(/[^a-zA-Z0-9\-_]/g, '');
        const filename = `payment-${safeOrderNumber}-${timestamp}.${ext}`;
        const filepath = join(process.cwd(), 'public', 'payment-proofs', filename);

        // Verify path stays within allowed directory
        const allowedDir = join(process.cwd(), 'public', 'payment-proofs');
        if (!filepath.startsWith(allowedDir)) {
          throw new Error('Invalid file path');
        }

        await writeFile(filepath, uint8Array);
        paymentProofPath = `/payment-proofs/${filename}`;
        
      } catch (uploadError) {
        console.error('Payment proof upload error:', uploadError);
        // Don't fail the payment if upload fails
      }
    }

    // Create payment record with PENDING status (requires admin verification)
    const payment = await prisma.upi_payments.create({
      data: {
        id: `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: order.id,
        amount,
        // paymentMethod: 'UPI', // Not in schema
        transactionId: upiTransactionId,
        // upiId: upiId || null, // Not in schema
        status: 'PENDING', // Requires admin verification
        // paymentProof: paymentProofPath, // Not in schema
        resourceType: 'order',
        updatedAt: new Date()
        // paidAt: new Date() // Not in schema
      }
    });

    // Atomically decrement stock — race-condition safe
    // Uses WHERE quantity >= X to prevent overselling
    const orderItems = order.orderItems.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const stockResult = await decrementStockAtomic(prisma, orderItems);

    if (!stockResult.success) {
      // Stock insufficient — cancel the payment record and fail
      await prisma.upi_payments.delete({ where: { id: payment.id } });
      return NextResponse.json(
        {
          error: 'Some items are no longer available',
          stockErrors: stockResult.failedItems,
        },
        { status: 409 }
      );
    }

    // Update order status to PAYMENT_RECEIVED (payment submitted + stock reserved, awaiting admin verification)
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAYMENT_RECEIVED' }
    });

    // Send payment received email to customer + admin
    try {
      const { sendPaymentReceivedEmail } = await import('@/lib/email');
      await sendPaymentReceivedEmail({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        transactionId: upiTransactionId,
        amount,
      });
    } catch {
      // Don't fail payment if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully! Your order is being processed and will be verified by our team shortly.',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });

  } catch (error) {
    console.error('UPI payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
