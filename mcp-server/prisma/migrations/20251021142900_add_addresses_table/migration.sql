-- CreateEnum for AddressType if not exists
DO $$ BEGIN
  CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING', 'BOTH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable addresses
CREATE TABLE IF NOT EXISTS "addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "addresses_userId_idx" ON "addresses"("userId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
