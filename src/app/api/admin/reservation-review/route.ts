import { NextRequest, NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { WorkflowError, workflowFailure } from "@/lib/staff-workflow";
import { OrderStatus } from "@prisma/client";

const eligible: OrderStatus[] = ["PAYMENT_RECEIVED", "CONFIRMED", "PROCESSING"];

export async function GET(request: NextRequest) {
  if (!(await staffSession("owner")))
    return NextResponse.json(
      { error: "Owner access required." },
      { status: 403 },
    );
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100);
  const page = Math.max(
    1,
    Number(request.nextUrl.searchParams.get("page")) || 1,
  );
  const rows = await prisma.order.findMany({
    where: {
      status: { in: eligible },
      orderNumber: q ? { contains: q, mode: "insensitive" } : undefined,
      orderItems: { some: { reservedUnits: null } },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      updatedAt: true,
      orderItems: {
        where: { reservedUnits: null },
        select: {
          id: true,
          quantity: true,
          product: { select: { title: true, measurementType: true } },
        },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    skip: (page - 1) * 15,
    take: 16,
  });
  return NextResponse.json({
    orders: rows.slice(0, 15),
    more: rows.length > 15,
  });
}

export async function POST(request: NextRequest) {
  const session = await staffSession("owner");
  if (!session)
    return NextResponse.json(
      { error: "Owner access required." },
      { status: 403 },
    );
  try {
    const { orderId, expectedUpdatedAt, reason, lines } = await request.json();
    if (
      typeof orderId !== "string" ||
      typeof expectedUpdatedAt !== "string" ||
      typeof reason !== "string" ||
      !reason.trim() ||
      reason.length > 300 ||
      !Array.isArray(lines) ||
      !lines.length ||
      lines.length > 100 ||
      !lines.every(
        (line) =>
          typeof line.id === "string" &&
          typeof line.units === "number" &&
          Number.isFinite(line.units) &&
          line.units >= 0,
      )
    )
      throw new WorkflowError(
        "Enter the original base units for every missing line and identify the record checked.",
        400,
      );
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id=${orderId} FOR UPDATE`;
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          updatedAt: true,
          status: true,
          orderItems: { where: { reservedUnits: null }, select: { id: true } },
        },
      });
      const provided = new Map<string, number>(
        lines.map((line) => [line.id, line.units]),
      );
      if (
        !order ||
        !eligible.includes(order.status) ||
        order.updatedAt.toISOString() !== expectedUpdatedAt ||
        order.orderItems.length !== lines.length ||
        !order.orderItems.every((line) => provided.has(line.id))
      ) {
        throw new WorkflowError(
          "This order has changed. Reload before recording original quantities.",
        );
      }
      for (const line of order.orderItems)
        await tx.orderItem.update({
          where: { id: line.id },
          data: { reservedUnits: provided.get(line.id) },
        });
      await tx.staffEvent.create({
        data: {
          actorId: session.user.id,
          resource: "order",
          recordId: orderId,
          action: "reconcile reservation",
          note: JSON.stringify({
            reason: reason.trim(),
            lines: Array.from(provided).map(([id, units]) => ({ id, units })),
          }),
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return workflowFailure(error);
  }
}
