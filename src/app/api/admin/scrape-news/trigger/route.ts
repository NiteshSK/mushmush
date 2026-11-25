import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runStaffJobs } from "@/lib/staff-jobs";

export async function GET(request: NextRequest) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json(
      { error: "Scheduler authentication required" },
      { status: 403 },
    );
  }
  const date = new Date().toISOString().slice(0, 10);
  const key = "news/" + date;
  await prisma.staffJob.upsert({
    where: { key },
    create: { key, kind: "news", resourceId: key, action: "import" },
    update: {},
  });
  await runStaffJobs(key);
  const result = await prisma.staffJob.findUnique({
    where: { key },
    select: { state: true, attempts: true },
  });
  return NextResponse.json(result, {
    status: result?.state === "failed" ? 503 : 200,
  });
}
