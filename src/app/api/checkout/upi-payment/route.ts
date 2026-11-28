import { acceptsRetailProof, RETAIL_PROOF_HINT } from "@/lib/payment-proof";
import { runStaffJobs } from "@/lib/staff-jobs";
import { after, NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { packsToBulk, availablePacks, isPackQuantity } from "@/lib/inventory";
import { WorkflowError, workflowFailure } from "@/lib/staff-workflow";
import { isValidOrderPaymentToken, ownsOrder } from '@/lib/order-access';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();
    
    const orderNumber = formData.get('orderNumber') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const upiTransactionId = formData.get('upiTransactionId') as string;
    const upiId = formData.get('upiId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const paymentToken = formData.get('paymentToken');
    const paymentProof = formData.get('paymentProof') as File | null;

    // Validate required fields
    if (!orderNumber || !upiTransactionId || !Number.isFinite(amount) || amount <= 0) {
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

    // Only the browser that created the order (payment token from verified
    // checkout) or the signed-in owner may submit a payment. Answer 404 for
    // anyone else so order numbers cannot be probed.
    if (!order || !(isValidOrderPaymentToken(order.id, paymentToken) || ownsOrder(session?.user, order))) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This order is not awaiting payment.' },
        { status: 409 }
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

    let proof: { mime: string; data: Uint8Array } | undefined;
    if (paymentProof && paymentProof.size > 0) {
      if (!acceptsRetailProof(paymentProof))
        return NextResponse.json({ error: RETAIL_PROOF_HINT }, { status: 400 });
      proof = { mime: paymentProof.type, data: new Uint8Array(await paymentProof.arrayBuffer()) };
    }
    const payment = await prisma.$transaction(async tx => {
      const claimed = await tx.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "PAYMENT_RECEIVED" } });
      if (!claimed.count) throw new WorkflowError("Payment has already been submitted.");
      for (const item of [...order.orderItems].sort((a,b) => a.productId - b.productId)) {
        await tx.$queryRaw`SELECT id FROM products WHERE id = ${item.productId} FOR UPDATE`;
        const sku = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
        const units = packsToBulk(item.quantity, sku.measurementValue, sku.measurementType);
        const available = availablePacks(sku.quantity, sku.measurementValue, sku.measurementType);
        if (sku.archivedAt || !sku.inStock || !isPackQuantity(item.quantity) || item.quantity > available ||
            !Number.isFinite(units) || units <= 0 || sku.quantity < units) {
          throw new WorkflowError("Stock changed for " + sku.title);
        }
        const remaining = sku.quantity - units;
        await tx.product.update({ where: { id: sku.id }, data: { quantity: remaining, inStock: availablePacks(remaining,sku.measurementValue,sku.measurementType)>0 } });
        await tx.orderItem.update({ where: { id: item.id }, data: { reservedUnits: units } });
        await tx.staffEvent.create({ data: { resource: "stock", recordId: String(sku.id), action: "reserve", actorId: "checkout", note: order.orderNumber + " · " + sku.quantity + " → " + remaining } });
      }
      const attempt = await tx.upi_payments.create({ data: { id: crypto.randomUUID(), orderId: order.id, status: "PENDING", amount: order.total, transactionId: upiTransactionId,
        resourceType: "order", updatedAt: new Date(), ...(proof && { proof: { create: proof } }) } });
      await tx.staffJob.createMany({data:["order-status","order-team"].map(kind=>({
        key:[kind,order.id,"PAYMENT_RECEIVED"].join("/"),kind,resourceId:order.id,action:"PAYMENT_RECEIVED"
      }))});
      return attempt;
    });

    after(() => runStaffJobs(order.id));

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
        status: "PAYMENT_RECEIVED"
      }
    });

  } catch (error) {
    return workflowFailure(error);
  }
}
