/**
 * Tests for stock validation and inventory decrement logic
 * in the verify-and-place-order checkout API.
 *
 * Products use bulk inventory (grams/ml). Each product has a
 * measurementValue + measurementType that defines one pack size.
 */

// ── Mock next/server before any imports ────────────────────

const mockJsonResponse = jest.fn();
jest.mock('next/server', () => {
  class FakeNextRequest {
    private body: string;
    constructor(_url: string, init: any) {
      this.body = init?.body || '{}';
    }
    async json() {
      return JSON.parse(this.body);
    }
  }
  class FakeNextResponse {
    static json(data: any, init?: { status?: number }) {
      mockJsonResponse(data, init);
      return { json: async () => data, status: init?.status || 200, data, _init: init };
    }
  }
  return {
    NextRequest: FakeNextRequest,
    NextResponse: FakeNextResponse,
  };
});

// ── Other mocks ────────────────────────────────────────────

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: { findFirst: jest.fn(), create: jest.fn() },
    addresses: { findUnique: jest.fn(), create: jest.fn() },
    order: { create: jest.fn() },
  },
}));

jest.mock('@/lib/otp-store', () => ({
  otpStore: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/inventory', () => ({
  availablePacks: jest.fn((quantity: number, measurementValue: number, measurementType: string) => {
    const packSize = measurementType === 'kg' ? measurementValue * 1000 : measurementValue;
    if (packSize <= 0) return 0;
    return Math.floor(quantity / packSize);
  }),
  packsToBulk: jest.fn((packs: number, measurementValue: number, measurementType: string) => {
    const packSize = measurementType === 'kg' ? measurementValue * 1000 : measurementValue;
    return packs * packSize;
  }),
}));

jest.mock('@/lib/invoice', () => ({
  generateInvoice: jest.fn().mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-1', pdfPath: '/inv.pdf' }),
  markInvoiceEmailSent: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
  sendOrderInvoiceEmail: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { POST } from '../../checkout/verify-and-place-order/route';
import { prisma } from '@/lib/prisma';
import { otpStore } from '@/lib/otp-store';
import { getServerSession } from 'next-auth';

// ── Helpers ────────────────────────────────────────────────

const validBody = (cartOverrides: any[] = []) => ({
  otp: '123456',
  email: 'test@example.com',
  customerName: 'Test User',
  customerPhone: '9876543210',
  billingAddress: { street: '1 Main St', city: 'Delhi', state: 'DL', zip: '110001', country: 'India' },
  shippingAddress: { street: '1 Main St', city: 'Delhi', state: 'DL', zip: '110001', country: 'India' },
  cartItems: cartOverrides.length
    ? cartOverrides
    : [{ id: 1, quantity: 2, price: 499 }],
  subtotal: 998,
  shippingFee: 50,
  convenienceFee: 12,
  total: 1060,
});

function makeRequest(body: any) {
  return new NextRequest('http://localhost:3000/api/checkout/verify-and-place-order', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as any;
}

function setupValidOTP() {
  (otpStore.get as jest.Mock).mockResolvedValue({
    otp: '123456',
    expiresAt: Date.now() + 300_000,
  });
  (otpStore.delete as jest.Mock).mockResolvedValue(undefined);
}

function setupSession() {
  (getServerSession as jest.Mock).mockResolvedValue({
    user: { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' },
  });
}

function setupAddress() {
  (prisma.addresses.create as jest.Mock).mockImplementation(({ data }) =>
    Promise.resolve({
      id: data.id,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
    })
  );
}

function setupOrder() {
  (prisma.order.create as jest.Mock).mockResolvedValue({
    id: 'order-1',
    orderNumber: 'ORD-123',
    total: 1060,
    status: 'CONFIRMED',
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    createdAt: new Date(),
    subtotal: 998,
    tax: 12,
    shipping: 50,
    orderItems: [
      {
        id: 'oi-1',
        quantity: 2,
        price: 499,
        product: { title: 'Oyster Mushroom Powder' },
      },
    ],
  });
}

/** Extract the data and status from the mocked NextResponse.json call */
function lastResponse(): { data: any; status: number } {
  const calls = mockJsonResponse.mock.calls;
  const last = calls[calls.length - 1];
  return { data: last[0], status: last[1]?.status || 200 };
}

// All test products use 100gm packs. Bulk quantity is in grams.
// Default order: 2 packs = 200gm consumed.
const PRODUCT_100GM = { measurementValue: 100, measurementType: 'gm' };

// ── Tests ──────────────────────────────────────────────────

describe('POST /api/checkout/verify-and-place-order — stock validation (bulk)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupValidOTP();
    setupSession();
    setupAddress();
    setupOrder();
  });

  it('rejects order when a product is out of stock (0 bulk qty)', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: 'Oyster Mushroom Powder', quantity: 0, inStock: false, ...PRODUCT_100GM },
    ]);

    await POST(makeRequest(validBody()));
    const { data, status } = lastResponse();

    expect(status).toBe(409);
    expect(data.stockErrors).toContain('"Oyster Mushroom Powder" is out of stock');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('rejects order when requested packs exceed available stock', async () => {
    // 100gm bulk = 1 pack of 100gm; ordering 5 packs should fail
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: 'Oyster Mushroom Powder', quantity: 100, inStock: true, ...PRODUCT_100GM },
    ]);

    const body = validBody([{ id: 1, quantity: 5, price: 499 }]);
    await POST(makeRequest(body));
    const { data, status } = lastResponse();

    expect(status).toBe(409);
    expect(data.stockErrors).toContain(
      '"Oyster Mushroom Powder" only has 1 unit(s) available'
    );
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('rejects order when product is not found in database', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

    await POST(makeRequest(validBody()));
    const { data, status } = lastResponse();

    expect(status).toBe(409);
    expect(data.stockErrors).toContain('Product not found: ID 1');
  });

  it('collects errors for multiple items', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: 'Oyster Powder', quantity: 0, inStock: false, ...PRODUCT_100GM },
      { id: 2, title: 'Lion Mane Powder', quantity: 200, inStock: true, ...PRODUCT_100GM }, // 2 packs
    ]);

    const body = validBody([
      { id: 1, quantity: 1, price: 499 },
      { id: 2, quantity: 5, price: 599 }, // only 2 packs available
    ]);

    await POST(makeRequest(body));
    const { data, status } = lastResponse();

    expect(status).toBe(409);
    expect(data.stockErrors).toHaveLength(2);
    expect(data.stockErrors[0]).toContain('out of stock');
    expect(data.stockErrors[1]).toContain('only has 2 unit(s)');
  });

  it('allows order when stock is sufficient and decrements bulk quantity', async () => {
    // 50kg = 50000gm, ordering 2 packs of 100gm = 200gm decrement
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: 'Oyster Mushroom Powder', quantity: 50000, inStock: true, ...PRODUCT_100GM },
    ]);
    (prisma.product.update as jest.Mock).mockResolvedValue({
      id: 1,
      quantity: 49800,
      inStock: true,
    });

    await POST(makeRequest(validBody()));
    const { data, status } = lastResponse();

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.order.create).toHaveBeenCalled();
    // Should decrement by 200gm (2 packs × 100gm)
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { quantity: { decrement: 200 } },
      })
    );
  });

  it('auto-marks product out of stock when remaining bulk < 1 pack', async () => {
    // 200gm stock, ordering 2 packs of 100gm = 200gm → 0 remaining
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: 'Oyster Mushroom Powder', quantity: 200, inStock: true, ...PRODUCT_100GM },
    ]);
    (prisma.product.update as jest.Mock)
      .mockResolvedValueOnce({ id: 1, quantity: 0, inStock: true })
      .mockResolvedValueOnce({ id: 1, quantity: 0, inStock: false });

    await POST(makeRequest(validBody()));
    const { data, status } = lastResponse();

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.product.update).toHaveBeenCalledTimes(2);
    expect(prisma.product.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { inStock: false, quantity: 0 },
      })
    );
  });

  it('does not mark out of stock when remaining bulk still has packs', async () => {
    // 50000gm stock, ordering 2 packs of 100gm → 49800gm remaining (498 packs)
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: 'Oyster Mushroom Powder', quantity: 50000, inStock: true, ...PRODUCT_100GM },
    ]);
    (prisma.product.update as jest.Mock).mockResolvedValue({
      id: 1,
      quantity: 49800,
      inStock: true,
    });

    await POST(makeRequest(validBody()));

    expect(prisma.product.update).toHaveBeenCalledTimes(1);
  });
});
