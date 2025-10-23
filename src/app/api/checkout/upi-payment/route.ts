import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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
    const existingPayment = await prisma.payment.findFirst({
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
    const duplicateTransaction = await prisma.payment.findFirst({
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
        
        // Create unique filename
        const timestamp = Date.now();
        const filename = `payment-${orderNumber}-${timestamp}.${paymentProof.name.split('.').pop()}`;
        const filepath = join(process.cwd(), 'public', 'payment-proofs', filename);
        
        await writeFile(filepath, uint8Array);
        paymentProofPath = `/payment-proofs/${filename}`;
        
        console.log('✅ Payment proof uploaded:', paymentProofPath);
      } catch (uploadError) {
        console.error('❌ Error uploading payment proof:', uploadError);
        // Don't fail the payment if upload fails
      }
    }

    // Create payment record with PENDING status (requires admin verification)
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount,
        paymentMethod: 'UPI',
        transactionId: upiTransactionId,
        upiId: upiId || null,
        status: 'PENDING', // Requires admin verification
        paymentProof: paymentProofPath,
        paidAt: new Date()
      }
    });

    // Update order status to PROCESSING (payment submitted, awaiting verification)
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' }
    });

    console.log('✅ UPI payment submitted for order:', orderNumber);
    console.log('💳 Transaction ID:', upiTransactionId);
    console.log('📊 Payment Status: PENDING (awaiting admin verification)');

    // TODO: Send confirmation email when email template is ready
    // For now, we'll skip email sending to avoid interface mismatch
    console.log('📧 Email notification skipped (to be implemented with proper template)');

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
    console.error('Error processing UPI payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
