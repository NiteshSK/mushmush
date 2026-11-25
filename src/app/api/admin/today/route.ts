import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin";
import { canWork, DUTIES } from "@/lib/staff-permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function available<T>(query: Promise<T>): Promise<T | null> {
  try {
    return await query;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!canWork(user, ...DUTIES)) return NextResponse.json({ error: "Staff access required." }, { status: user ? 403 : 401 });
  const finance = canWork(user, "finance"), fulfillment = canWork(user, "fulfillment");
  const [paymentQueue, trainingQueue, pack, fresh, stock] = await Promise.all([
    finance ? available(prisma.order.aggregate({ where: { status: "PAYMENT_RECEIVED" }, _count: true, _min: { updatedAt: true } })) : null,
    finance ? available(prisma.upi_payments.aggregate({ where: { trainingRegistrationId: { not: null }, status: "PENDING" }, _count: true, _min: { createdAt: true } })) : null,
    fulfillment ? available(prisma.order.count({ where: { status: "CONFIRMED" } })) : null,
    fulfillment ? available(prisma.order.count({ where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] },
      orderItems: { some: { product: { fulfillmentClass: "fresh" } } } } })) : null,
    fulfillment ? available(prisma.$queryRaw<{ count: number }[]>`SELECT count(*)::int AS count FROM products WHERE "archivedAt" IS NULL AND
      (NOT "inStock" OR "measurementValue" <= 0 OR quantity < 6 * "measurementValue" *
        CASE WHEN lower("measurementType") IN ('kg','l','litre','litres') THEN 1000 ELSE 1 END)`) : null
  ]);
  const dates = [paymentQueue?._min.updatedAt, trainingQueue?._min.createdAt].filter((date): date is Date => !!date);
  return NextResponse.json({
    finance, fulfillment, editor: canWork(user, "editor"), trainer: canWork(user, "trainer"),
    payments: paymentQueue?._count ?? null, training: trainingQueue?._count ?? null,
    pack, fresh, stock: stock?.[0]?.count ?? null,
    oldest: dates.length ? new Date(Math.min(...dates.map(date => date.getTime()))) : null,
    updatedAt: new Date()
  }, { headers: { "Cache-Control": "no-store" } });
}
