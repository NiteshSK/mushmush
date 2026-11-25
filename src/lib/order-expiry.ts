/**
 * Cancels retail orders that were placed but never paid.
 *
 * An order is created PENDING after OTP checkout. Stock is reserved only when the
 * shopper submits UPI details (/api/checkout/upi-payment moves PENDING to
 * PAYMENT_RECEIVED and sets order_items.reservedUnits in the same transaction),
 * so a PENDING order holds no stock and cancelling it releases none.
 * A coupon is recorded at order time, so cancelling releases that use.
 */
import { prisma } from '@/lib/prisma';

export const UNPAID_ORDER_HOURS = 48;

export async function expireUnpaidOrders(now: Date = new Date(), hours: number = UNPAID_ORDER_HOURS): Promise<{ cancelled: string[] }> {
  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const stale = await prisma.order.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff }, upi_payments: { none: {} } },
    select: { id: true, orderNumber: true },
  });

  const cancelled: string[] = [];
  for (const order of stale) {
    const done = await prisma.$transaction(async (tx) => {
      // Re-check inside the transaction: a payment may have arrived since the query.
      const claimed = await tx.order.updateMany({
        where: { id: order.id, status: 'PENDING', upi_payments: { none: {} } },
        data: { status: 'CANCELLED' },
      });
      if (!claimed.count) return false;
      const usage = await tx.couponUsage.findUnique({ where: { orderId: order.id }, select: { id: true, couponId: true } });
      if (usage) {
        await tx.couponUsage.delete({ where: { id: usage.id } });
        // Never below zero.
        await tx.coupon.updateMany({ where: { id: usage.couponId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
      }
      return true;
    });
    if (done) cancelled.push(order.orderNumber);
  }
  return { cancelled };
}
