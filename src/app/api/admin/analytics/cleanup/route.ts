import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VISIT_RETENTION_DAYS } from "@/lib/visit-analytics";

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Scheduler access required." }, { status: 403 });
  }
  const cutoff = new Date(Date.now() - VISIT_RETENTION_DAYS * 86_400_000);
  const result = await prisma.storefrontVisit.deleteMany({ where: { lastSeenAt: { lt: cutoff } } });
  return NextResponse.json({ removed: result.count });
}
