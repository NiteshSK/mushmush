import { NextRequest, NextResponse } from "next/server";
import { runStaffJobs } from "@/lib/staff-jobs";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== "Bearer " + process.env.CRON_SECRET
  )
    return NextResponse.json(
      { error: "Scheduler access required" },
      { status: 403 },
    );
  await runStaffJobs();
  return NextResponse.json({ success: true });
}
export async function POST(request: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  const { key } = await request.json();
  if (typeof key !== "string")
    return NextResponse.json({ error: "Choose a failed job" }, { status: 400 });
  const job = await prisma.staffJob.findUnique({ where: { key } });
  if (
    !job ||
    !(
      await prisma.staffJob.updateMany({
        where: { key, state: "failed" },
        data: { nextRun: new Date() },
      })
    ).count
  )
    return NextResponse.json(
      { error: "Job is no longer waiting for retry" },
      { status: 409 },
    );
  await runStaffJobs(job.resourceId);
  const result = await prisma.staffJob.findUnique({
    where: { key },
    select: { state: true, lastError: true },
  });
  return NextResponse.json(result, {
    status: result?.state === "failed" ? 503 : 200,
  });
}
