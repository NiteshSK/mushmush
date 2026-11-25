import LegacyReservationReview from "./legacy-reservations";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RetryJob from "./retry";
export const dynamic = "force-dynamic";
export default async function Operations() {
  if (!(await isAdmin())) redirect("/admin");
  const [failed, mismatches, backlog, oldestPayment] = await Promise.all([
    prisma.staffJob.findMany({
      where: { state: "failed" },
      orderBy: { nextRun: "asc" },
      take: 50,
    }),
    prisma.order.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"],
        },
        upi_payments: { none: { status: "VERIFIED" } },
      },
      select: { orderNumber: true },
      take: 50,
    }),
    prisma.staffJob.aggregate({where:{state:{not:"done"}},_count:true,_min:{createdAt:true}}),
    prisma.upi_payments.aggregate({where:{status:"PENDING"},_count:true,_min:{createdAt:true}}),
  ]);
  return (
    <section className="space-y-6">
      <h1 className="text-2xl">Reconciliation</h1>
      <div>
        <h2>Background work</h2>
        <p>{backlog._count} unfinished jobs{backlog._min.createdAt && " · oldest created "+backlog._min.createdAt.toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})+" IST"}</p>
        <p>{oldestPayment._count} payments awaiting review{oldestPayment._min.createdAt && " · oldest submitted "+oldestPayment._min.createdAt.toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})+" IST"}</p>
        <h2>Failed jobs</h2>
        {failed.length ? (
          failed.map((j) => (
            <p key={j.key}>
              {j.kind} · {j.resourceId} · {j.attempts} attempts · {j.lastError}{" "}
              · eligible for retry{" "}
              {j.nextRun.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}{" "}
              IST <RetryJob jobKey={j.key} />
            </p>
          ))
        ) : (
          <p>No failed jobs.</p>
        )}
      </div>
      <div>
        <h2>Orders awaiting bank reconciliation</h2>
        {mismatches.length ? (
          mismatches.map((o) => <p key={o.orderNumber}>{o.orderNumber}</p>)
        ) : (
          <p>No mismatches found.</p>
        )}
      </div>
      <LegacyReservationReview />
    </section>
  );
}
