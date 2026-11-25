CREATE INDEX IF NOT EXISTS "addresses_userId_idx" ON addresses ("userId");
CREATE INDEX IF NOT EXISTS "orders_shippingAddressId_idx" ON orders ("shippingAddressId");
CREATE INDEX IF NOT EXISTS "orders_billingAddressId_idx" ON orders ("billingAddressId");
ALTER TABLE staff_jobs ADD COLUMN "lastError" TEXT;
