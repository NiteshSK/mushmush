import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { availablePacks, formatBulkQuantity, MAX_BULK_STOCK } from "./inventory";
import { WorkflowError } from "./staff-workflow";
import { sendRestockNotifications } from "./notifications";

export type StockAction = "stocktake" | "receive" | "damage";

type InventoryChange = {
  field?: string;
  value?: unknown;
  action?: StockAction;
  reason?: string;
  movementId?: string;
  expectedQuantity?: number;
  expectedUnit?: string;
  expectedUpdatedAt?: string;
};

export function projectedStock(
  action: StockAction,
  before: number,
  units: number,
) {
  if (
    !Number.isFinite(units) ||
    units < 0 ||
    (action !== "stocktake" && units === 0)
  ) {
    throw new WorkflowError(
      "Enter a valid quantity in the selected unit.",
      400,
    );
  }
  const after =
    action === "stocktake"
      ? units
      : before + (action === "receive" ? units : -units);
  if (after < 0)
    throw new WorkflowError("The adjustment would leave less than zero stock.");
  if (!Number.isFinite(after) || after > MAX_BULK_STOCK)
    throw new WorkflowError("The adjustment would exceed the supported stock quantity.");
  return after;
}

export async function changeInventory(
  productId: number,
  input: InventoryChange,
  actorId: string,
) {
  if (!Number.isSafeInteger(productId) || productId <= 0)
    throw new WorkflowError("Invalid product.", 400);
  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM products WHERE id = ${productId} FOR UPDATE`;
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product || product.archivedAt)
      throw new WorkflowError("This product is unavailable.", 404);
    const { field, value } = input;
    let data: Prisma.ProductUpdateInput;
    let action: string;
    let note: string;
    let eventId: string | undefined;
    if (field === "quantity") {
      if (
        !input.action ||
        !["stocktake", "receive", "damage"].includes(input.action) ||
        typeof value !== "number"
      )
        throw new WorkflowError(
          "Choose the stock adjustment type and quantity.",
          400,
        );
      const reason = input.reason?.trim();
      if (!reason || reason.length > 300)
        throw new WorkflowError("Enter a reason of 1 to 300 characters.", 400);
      if (
        !input.movementId ||
        !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(
          input.movementId,
        )
      )
        throw new WorkflowError("A stock movement reference is required.", 400);
      eventId = "movement/" + input.movementId;
      const prior = await tx.staffEvent.findUnique({ where: { id: eventId } });
      if (prior) {
        const previous = prior.note && JSON.parse(prior.note);
        if (
          prior.recordId !== String(productId) ||
          prior.actorId !== actorId ||
          prior.action !== input.action ||
          previous.amount !== value ||
          previous.reason !== reason
        ) {
          throw new WorkflowError(
            "This movement reference belongs to another adjustment.",
          );
        }
        return { updated: product, restocked: false };
      }
      if (
        input.expectedUnit &&
        input.expectedUnit !== product.measurementType
      ) {
        throw new WorkflowError(
          "The product unit changed. Reload and review the adjustment.",
        );
      }
      if (
        input.action === "stocktake" &&
        (input.expectedUpdatedAt !== product.updatedAt.toISOString() ||
          input.expectedQuantity !== product.quantity)
      ) {
        throw new WorkflowError(
          "Stock changed since you opened the count. Reload the product and count again.",
        );
      }
      const after = projectedStock(input.action, product.quantity, value);
      data = {
        quantity: after,
        inStock:
          availablePacks(
            after,
            product.measurementValue,
            product.measurementType,
          ) > 0,
      };
      action = input.action;
      note = JSON.stringify({
        before: product.quantity,
        after,
        amount: value,
        reason,
        unit: product.measurementType,
      });
    } else {
      if (
        input.expectedUpdatedAt &&
        input.expectedUpdatedAt !== product.updatedAt.toISOString()
      )
        throw new WorkflowError("This product changed. Reload and review it.");
      switch (field) {
        case "price":
          if (!input.expectedUpdatedAt)
            throw new WorkflowError("Refresh the price before saving.", 409);
          if (
            typeof value !== "number" ||
            !Number.isFinite(value) ||
            value <= 0
          )
            throw new WorkflowError("Price must be above zero.", 400);
          data = { price: value };
          break;
        case "featured":
        case "inStock":
          if (typeof value !== "boolean")
            throw new WorkflowError(
              "Choose an availability or featured state.",
              400,
            );
          if (
            field === "inStock" &&
            value &&
            availablePacks(
              product.quantity,
              product.measurementValue,
              product.measurementType,
            ) < 1
          )
            throw new WorkflowError(
              "Receive stock before making this product available.",
            );
          data = { [field]: value };
          break;
        default:
          throw new WorkflowError(
            "Use the product editor for these changes.",
            400,
          );
      }
      action = field;
      note = String(product[field]) + " → " + String(value);
    }
    const updated = await tx.product.update({ where: { id: productId }, data });
    await tx.staffEvent.create({
      data: {
        id: eventId,
        actorId,
        resource: "stock",
        recordId: String(productId),
        action,
        note,
      },
    });
    return { updated, restocked: !product.inStock && updated.inStock };
  });
  if (result.restocked) await sendRestockNotifications(productId);
  const { updated } = result;
  return {
    ...updated,
    bulkQuantity: updated.quantity,
    bulkDisplay: formatBulkQuantity(updated.quantity, updated.measurementType),
    stockQuantity: availablePacks(
      updated.quantity,
      updated.measurementValue,
      updated.measurementType,
    ),
  };
}
