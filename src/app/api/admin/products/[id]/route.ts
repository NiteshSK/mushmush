import { changeInventory } from "@/lib/staff-inventory";
import { workflowFailure } from "@/lib/staff-workflow";
import { NextRequest, NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// The catalog editor and older staff clients share validation, version checks and archival rules.
export { PUT } from "@/app/api/products/[id]/route";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await staffSession("fulfillment");
  if (!session)
    return NextResponse.json(
      { error: "Fulfillment access required." },
      { status: 403 },
    );
  try {
    return NextResponse.json(
      await changeInventory(
        Number((await context.params).id),
        await request.json(),
        session.user.id,
      ),
    );
  } catch (error) {
    return workflowFailure(error);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await staffSession("fulfillment");
  if (!session)
    return NextResponse.json(
      { error: "Fulfillment access required." },
      { status: 403 },
    );
  const { id } = await context.params;
  const page = Math.max(
    1,
    Number(request.nextUrl.searchParams.get("page")) || 1,
  );
  const events = await prisma.staffEvent.findMany({
    where: { resource: "stock", recordId: id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * 20,
    take: 21,
  });
  const actors = await prisma.user.findMany({
    where: { id: { in: events.map((e) => e.actorId) } },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json({
    rows: events.slice(0, 20).map((event) => ({
      ...event,
      actor:
        actors.find((user) => user.id === event.actorId)?.name ||
        actors.find((user) => user.id === event.actorId)?.email ||
        event.actorId,
    })),
    more: events.length > 20,
  });
}
