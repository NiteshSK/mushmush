import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInvoiceByOrderId, generateInvoice } from '@/lib/invoice';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/orders/[id]/invoice
 * Get invoice by order ID — generates on-demand only if payment is verified
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: orderId } = params;

    let invoice = await getInvoiceByOrderId(orderId);

    // If no invoice exists, only generate if payment is verified
    if (!invoice) {
      // SECURITY: Check payment is verified before generating invoice
      const verifiedPayment = await prisma.upi_payments.findFirst({
        where: { orderId, status: 'VERIFIED' },
      });

      if (!verifiedPayment) {
        return NextResponse.json(
          { error: 'Invoice is not available yet. Payment must be verified first.' },
          { status: 403 }
        );
      }

      try {
        invoice = await generateInvoice(orderId);
      } catch (genError: any) {
        console.error('Invoice generation failed:', genError);
        return NextResponse.json(
          { error: genError.message || 'Failed to generate invoice' },
          { status: 500 }
        );
      }
    }

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice could not be generated for this order' },
        { status: 404 }
      );
    }

    // Check if user has access to this invoice
    if (session.user.role !== 'ADMIN') {
      const orderUserId = invoice.order?.userId;
      if (orderUserId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to access this invoice' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(invoice);

  } catch (error) {
    console.error('Error fetching invoice by order ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
