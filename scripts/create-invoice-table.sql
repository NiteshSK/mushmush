-- Create Invoice table
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" TEXT PRIMARY KEY,
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueAt" TIMESTAMP(3),
  "orderId" TEXT UNIQUE NOT NULL,
  "pdfPath" TEXT,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerPhone" TEXT,
  "billingAddress" JSONB,
  "shippingAddress" JSONB,
  "subtotal" DOUBLE PRECISION,
  "tax" DOUBLE PRECISION,
  "shipping" DOUBLE PRECISION,
  "total" DOUBLE PRECISION,
  "invoiceItems" JSONB,
  "generatedAt" TIMESTAMP(3),
  "emailSent" BOOLEAN NOT NULL DEFAULT false,
  "emailSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "invoices_orderId_idx" ON "invoices"("orderId");
CREATE INDEX IF NOT EXISTS "invoices_customerEmail_idx" ON "invoices"("customerEmail");
CREATE INDEX IF NOT EXISTS "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");
