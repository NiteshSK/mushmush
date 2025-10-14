import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInvoiceById } from '@/lib/invoice';

/**
 * GET /api/invoices/[id]
 * Get invoice details and optionally download PDF
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
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this invoice
    // Admin can access all invoices, users can only access their own
    if (session.user.role !== 'ADMIN') {
      // Need to check if this invoice belongs to the user
      // This requires fetching the order and checking userId
      const orderUserId = invoice.order?.userId;
      if (orderUserId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to access this invoice' },
          { status: 403 }
        );
      }
    }

    // If download parameter is true, redirect to the Blob URL
    if (download && invoice.pdfPath) {
      // The pdfPath now contains the full Vercel Blob URL
      // We can either redirect or fetch and return the PDF
      // Redirecting is simpler and more efficient
      return NextResponse.redirect(invoice.pdfPath);
    }

    // Return invoice details
    return NextResponse.json(invoice);

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
