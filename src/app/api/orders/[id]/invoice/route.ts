import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInvoiceByOrderId } from '@/lib/invoice';

/**
 * GET /api/orders/[id]/invoice
 * Get invoice by order ID
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

    const invoice = await getInvoiceByOrderId(orderId);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found for this order' },
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
