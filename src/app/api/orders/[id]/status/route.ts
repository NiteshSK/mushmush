import { canWork } from "@/lib/staff-permissions";
import { runStaffJobs } from "@/lib/staff-jobs";
import { after, NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { availablePacks } from "@/lib/inventory";
import { WorkflowError, workflowFailure } from "@/lib/staff-workflow";

const allowed: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAYMENT_RECEIVED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentUser();
  if (!actor || !canWork(actor, "finance", "fulfillment"))
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  try {
    const { id } = await context.params;
    const { status, expectedStatus, paymentId, verificationNotes } =
      await request.json();
    if (
      !canWork(
        actor,
        status === "CONFIRMED" || status === "CANCELLED"
          ? "finance"
          : "fulfillment",
      )
    )
      throw new WorkflowError(
        "This decision requires a different staff permission.",
        403,
      );
    if (!Object.prototype.hasOwnProperty.call(allowed, status))
      throw new WorkflowError("Unknown order status.", 400);
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.order.findUnique({
        where: { id },
        include: { orderItems: { orderBy: { productId: "asc" } } },
      });
      if (!order) throw new WorkflowError("Order not found.", 404);
      if (order.status === status) return { id, status };
      if (
        order.status !== expectedStatus ||
        !allowed[order.status].includes(status)
      )
        throw new WorkflowError(
          "This order changed. Refresh to see its next action.",
        );
      const note =
        typeof verificationNotes === "string"
          ? verificationNotes.trim().slice(0, 1000)
          : undefined;
      if (status === "CONFIRMED") {
        if (typeof paymentId !== "string")
          throw new WorkflowError("Select the payment you checked.", 400);
        const checked = await tx.upi_payments.updateMany({
          where: {
            id: paymentId,
            orderId: id,
            status: "PENDING",
            amount: order.total,
          },
          data: {
            status: "VERIFIED",
            verifiedByUserId: actor.id,
            decisionNotes: note,
            updatedAt: new Date(),
          },
        });
        if (!checked.count)
          throw new WorkflowError(
            "The payment or amount no longer matches this order.",
          );
      }
      if (status === "CANCELLED" && order.status !== "PENDING") {
        for (const item of order.orderItems) {
          if (item.reservedUnits == null)
            throw new WorkflowError(
              "This older order has no saved reservation quantity. Reconcile its stock before cancellation.",
            );
          await tx.$queryRaw`SELECT id FROM products WHERE id = ${item.productId} FOR UPDATE`;
          const sku = await tx.product.findUniqueOrThrow({
            where: { id: item.productId },
          });
          const restored = sku.quantity + item.reservedUnits;
          await tx.product.update({
            where: { id: sku.id },
            data: {
              quantity: restored,
              inStock:
                !sku.archivedAt &&
                availablePacks(
                  restored,
                  sku.measurementValue,
                  sku.measurementType,
                ) > 0,
            },
          });
          await tx.staffEvent.create({
            data: {
              actorId: actor.id,
              resource: "stock",
              recordId: String(sku.id),
              action: "restore",
              note: order.orderNumber + " · " + sku.quantity + " → " + restored,
            },
          });
        }
        await tx.upi_payments.updateMany({
          where: { orderId: id, status: "PENDING" },
          data: {
            status: "FAILED",
            verifiedByUserId: actor.id,
            updatedAt: new Date(),
          },
        });
      }
      await tx.staffEvent.create({
        data: {
          actorId: actor.id,
          resource: "order",
          recordId: id,
          action: status,
          note,
        },
      });
      for (const kind of status === "CONFIRMED"
        ? ["order-status", "order-team", "invoice"]
        : ["order-status", "order-team"]) {
        const key = [kind, id, status].join("/");
        await tx.staffJob.upsert({
          where: { key },
          create: { key, kind, resourceId: id, action: status },
          update: {},
        });
      }
      return tx.order.update({
        where: { id },
        data: { status },
        select: { id: true, orderNumber: true, status: true },
      });
    });
    after(() => runStaffJobs(id));
    return NextResponse.json({ success: true, order: result });
  } catch (error) {
    return workflowFailure(error);
  }
}
