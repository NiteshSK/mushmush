-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "fulfillmentClass" TEXT;

-- AlterTable
ALTER TABLE "public"."order_items" ADD COLUMN     "reservedUnits" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."upi_payments" ADD COLUMN     "decisionNotes" TEXT;
CREATE TABLE payment_proofs ("paymentId" TEXT PRIMARY KEY REFERENCES upi_payments(id) ON DELETE CASCADE,
  mime TEXT NOT NULL, data BYTEA NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

-- CreateTable
CREATE TABLE "public"."staff_events" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff_jobs" (
    "key" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRun" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_jobs_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "staff_events_resource_recordId_createdAt_idx" ON "public"."staff_events"("resource", "recordId", "createdAt");

-- CreateIndex
CREATE INDEX "staff_jobs_state_nextRun_idx" ON "public"."staff_jobs"("state", "nextRun");

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

