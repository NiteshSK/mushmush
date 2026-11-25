import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staffSession } from "@/lib/admin";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await staffSession("finance", "fulfillment")))
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  const { id } = await params;
  const events = await prisma.staffEvent.findMany({
    where: { resource: "order", recordId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const people = await prisma.user.findMany({
    where: { id: { in: Array.from(new Set(events.map((e) => e.actorId))) } },
    select: { id: true, name: true },
  });
  const names = new Map(people.map((p) => [p.id, p.name]));
  return NextResponse.json(
    events.map((e) => ({
      id: e.id,
      action: e.action,
      note: e.note,
      createdAt: e.createdAt,
      actor: names.get(e.actorId) || "Staff",
    })),
  );
}
