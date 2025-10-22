-- Create Invoice table
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" TEXT PRIMARY KEY,
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "orderId" TEXT UNIQUE NOT NULL,
  "pdfPath" TEXT,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "billingAddress" JSONB NOT NULL,
  "shippingAddress" JSONB NOT NULL,
  "subtotal" DOUBLE PRECISION NOT NULL,
  "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL,
  "invoiceItems" JSONB NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "emailSent" BOOLEAN NOT NULL DEFAULT false,
  "emailSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "invoices_orderId_idx" ON "invoices"("orderId");
CREATE INDEX IF NOT EXISTS "invoices_customerEmail_idx" ON "invoices"("customerEmail");
CREATE INDEX IF NOT EXISTS "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");
