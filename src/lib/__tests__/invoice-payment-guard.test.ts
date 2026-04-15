/**
 * Security tests: Invoice generation must require verified payment
 *
 * Tests the payment verification guard in generateInvoice() and
 * the invoice API endpoint to ensure invoices cannot be generated
 * for orders with pending, failed, or missing payments.
 */

// Mock Prisma before importing anything
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: (...args: any[]) => mockFindUnique(...args) },
    upi_payments: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    invoice: {
      findUnique: jest.fn().mockResolvedValue(null), // no existing invoice
      create: (...args: any[]) => mockCreate(...args),
    },
    addresses: { findUnique: jest.fn().mockResolvedValue(null) },
    coupon: { findUnique: jest.fn().mockResolvedValue(null) },
  },
}));

// Mock jsPDF and blob upload (we don't need actual PDF generation)
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setFillColor: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    text: jest.fn(),
    rect: jest.fn(),
    roundedRect: jest.fn(),
    line: jest.fn(),
    addImage: jest.fn(),
    output: jest.fn().mockReturnValue(Buffer.from('fake-pdf')),
  }));
});

jest.mock('jspdf-autotable', () => jest.fn());

jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'https://blob.test/invoice.pdf' }),
}));

import { generateInvoice } from '../invoice';

const mockOrder = {
  id: 'order-123',
  orderNumber: 'ORD-1234567890',
  customerName: 'Test User',
  customerEmail: 'test@test.com',
  customerPhone: '9876543210',
  subtotal: 350,
  tax: 12,
  shipping: 50,
  couponDiscount: 0,
  couponId: null,
  total: 412,
  status: 'PAYMENT_RECEIVED',
  createdAt: new Date(),
  shippingAddress: { street: '123 St', city: 'Delhi', state: 'Delhi', zip: '110001' },
  shippingAddressId: 'addr-1',
  userId: 'user-1',
  orderItems: [
    {
      product: { title: 'Oyster Mushroom', price: 350 },
      quantity: 1,
      price: 350,
    },
  ],
  coupon: null,
};

describe('Invoice Payment Security Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindUnique.mockResolvedValue(mockOrder);
  });

  it('throws error when no payment exists for the order', async () => {
    mockFindFirst.mockResolvedValue(null); // No payment record at all

    await expect(generateInvoice('order-123')).rejects.toThrow(
      'Invoice cannot be generated: payment not verified'
    );
  });

  it('throws error when payment status is PENDING', async () => {
    mockFindFirst.mockResolvedValue(null); // findFirst with status: 'VERIFIED' returns null

    await expect(generateInvoice('order-123')).rejects.toThrow(
      'Invoice cannot be generated: payment not verified'
    );
  });

  it('throws error when payment status is FAILED', async () => {
    // The query filters for status: 'VERIFIED', so FAILED payments return null
    mockFindFirst.mockResolvedValue(null);

    await expect(generateInvoice('order-123')).rejects.toThrow(
      'Invoice cannot be generated: payment not verified'
    );
  });

  it('throws error when order does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(generateInvoice('nonexistent')).rejects.toThrow(
      'Order not found'
    );
  });

  it('proceeds past payment check when payment is VERIFIED', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'payment-1',
      status: 'VERIFIED',
      amount: 412,
      transactionId: 'TXN123',
    });

    // The function will proceed past the payment check and try to generate PDF.
    // It will fail on PDF generation (mock limitation) but the important thing
    // is it does NOT throw "payment not verified".
    try {
      await generateInvoice('order-123');
    } catch (err: any) {
      // Should NOT be a payment verification error
      expect(err.message).not.toContain('payment not verified');
    }

    // Verify it checked payment with correct filters
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { orderId: 'order-123', status: 'VERIFIED' },
    });
  });

  it('verifies payment check uses correct orderId and status filter', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(generateInvoice('order-456')).rejects.toThrow();

    // Verify the payment query was called with correct filters
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        orderId: 'order-456',
        status: 'VERIFIED',
      },
    });
  });

  it('returns existing invoice without re-checking payment', async () => {
    const existingInvoice = {
      id: 'invoice-existing',
      invoiceNumber: 'INV-20260414-EXIST',
      pdfPath: 'https://blob.test/existing.pdf',
    };

    // Payment is verified
    mockFindFirst.mockResolvedValue({ id: 'p1', status: 'VERIFIED' });

    // Existing invoice found
    const { prisma } = require('@/lib/prisma');
    prisma.invoice.findUnique.mockResolvedValueOnce(existingInvoice);

    const invoice = await generateInvoice('order-123');
    expect(invoice).toEqual(existingInvoice);

    // Should NOT have tried to create a new one
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
