import { runStaffJobs } from "@/lib/staff-jobs";
import { after, NextRequest, NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { decideTraining, workflowFailure } from "@/lib/staff-workflow";

export async function GET(req: NextRequest) {
  if (!(await staffSession("finance")))
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  const status = req.nextUrl.searchParams.get("status") || "PENDING";
  if (status !== "PENDING" && status !== "VERIFIED" && status !== "FAILED")
    return NextResponse.json(
      { error: "Unknown payment state" },
      { status: 400 },
    );
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const rows = await prisma.upi_payments.findMany({
    where: { status, trainingRegistrationId: { not: null } },
    skip: (page - 1) * 25,
    take: 26,
    orderBy: [
      { createdAt: status === "PENDING" ? "asc" : "desc" },
      { id: "asc" },
    ],
    select: {
      id: true,
      amount: true,
      transactionId: true,
      createdAt: true,
      status: true,
      decisionNotes: true,
      training_registrations: {
        select: {
          registrationNumber: true,
          participantName: true,
          trainingProgram: { select: { name: true } },
        },
      },
    },
  });
  return NextResponse.json({ rows: rows.slice(0, 25), more: rows.length > 25 });
}
export async function PUT(req: NextRequest) {
  const user = (await staffSession("finance"))?.user;
  if (!user)
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  try {
    const { paymentId, action, note } = await req.json();
    if (
      typeof paymentId !== "string" ||
      !["approve", "reject"].includes(action) ||
      (note != null && typeof note !== "string")
    )
      return NextResponse.json(
        { error: "Select a payment and a decision." },
        { status: 400 },
      );
    const registration = await decideTraining({
      paymentId,
      approve: action === "approve",
      actor: user.id,
      note,
    });
    after(() => runStaffJobs(registration.id));
    return NextResponse.json({ registration });
  } catch (error) {
    return workflowFailure(error);
  }
}
