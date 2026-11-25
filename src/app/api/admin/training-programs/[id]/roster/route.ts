import { NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await staffSession("trainer")))
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  const id = Number((await params).id);
  const program = await prisma.trainingProgram.findUnique({
    where: { id },
    select: { seatsPerDate: true },
  });
  if (!program)
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  const rows = await prisma.$queryRaw<
    { day: string | null; paid: number; pending: number }[]
  >`
    SELECT to_char((r."preferredStartDate" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata','YYYY-MM-DD') AS day,
      count(*) FILTER (WHERE EXISTS(SELECT 1 FROM upi_payments p WHERE p."trainingRegistrationId"=r.id AND p.status='VERIFIED'))::int AS paid,
      count(*) FILTER (WHERE EXISTS(SELECT 1 FROM upi_payments p WHERE p."trainingRegistrationId"=r.id AND p.status='PENDING')
        AND NOT EXISTS(SELECT 1 FROM upi_payments p WHERE p."trainingRegistrationId"=r.id AND p.status='VERIFIED'))::int AS pending
    FROM training_registrations r WHERE r."trainingProgramId"=${id} AND r.status <> 'CANCELLED'
    GROUP BY day ORDER BY day DESC NULLS LAST LIMIT 60`;
  return NextResponse.json({ capacity: program.seatsPerDate, rows });
}
