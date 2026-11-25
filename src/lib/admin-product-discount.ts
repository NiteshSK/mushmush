import { DiscountType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { staffSession } from "./admin";
import { prisma } from "./prisma";
import { isUsableDiscount } from "./product-pricing";
import { WorkflowError, workflowFailure } from "./staff-workflow";

export async function saveProductDiscount(
  request: NextRequest,
  discountId?: number,
) {
  try {
    if (!(await staffSession("editor"))?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      discountId !== undefined &&
      (!Number.isSafeInteger(discountId) || discountId < 1)
    )
      throw new WorkflowError("Invalid discount.", 400);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new WorkflowError("Enter the discount details.", 400);

    const discount = await prisma.$transaction(
      async (tx) => {
        const current =
          discountId === undefined
            ? null
            : await tx.productDiscount.findUnique({
                where: { id: discountId },
              });
        if (discountId !== undefined && !current)
          throw new WorkflowError("Discount not found.", 404);
        if (
          current &&
          body.expectedUpdatedAt &&
          new Date(body.expectedUpdatedAt).getTime() !==
            current.updatedAt.getTime()
        )
          throw new WorkflowError(
            "Another staff member updated this discount. Refresh before saving.",
          );
        const productId = current?.productId ?? Number(body.productId);
        if (!Number.isSafeInteger(productId) || productId < 1)
          throw new WorkflowError("Select a product.", 400);
        const product = await tx.product.findFirst({
          where: { id: productId, archivedAt: null },
          select: { id: true, title: true, price: true },
        });
        if (!product) throw new WorkflowError("Product not found.", 404);
        const type = body.type ?? current?.type;
        const value =
          body.value === undefined ? current?.value : Number(body.value);
        if (
          !(
            type === DiscountType.PERCENTAGE ||
            type === DiscountType.FIXED_AMOUNT
          ) ||
          !Number.isFinite(value) ||
          !isUsableDiscount(product.price, { type, value })
        )
          throw new WorkflowError(
            "Choose a discount that reduces the price and leaves a positive pack price.",
            400,
          );
        const startDate = new Date(
          body.startDate ?? current?.startDate ?? Date.now(),
        );
        const endInput =
          body.endDate === undefined ? current?.endDate : body.endDate;
        const endDate = endInput ? new Date(endInput) : null;
        if (
          !Number.isFinite(startDate.getTime()) ||
          (endDate &&
            (!Number.isFinite(endDate.getTime()) || endDate < startDate))
        )
          throw new WorkflowError(
            "Choose an end date on or after the start.",
            400,
          );
        const isActive = body.isActive ?? current?.isActive ?? true;
        if (typeof isActive !== "boolean")
          throw new WorkflowError("Choose an activation state.", 400);
        if (
          isActive &&
          (await tx.productDiscount.findFirst({
            where: {
              productId,
              isActive: true,
              ...(discountId ? { id: { not: discountId } } : {}),
              ...(endDate ? { startDate: { lte: endDate } } : {}),
              OR: [{ endDate: null }, { endDate: { gte: startDate } }],
            },
            select: { id: true },
          }))
        )
          throw new WorkflowError(
            "An enabled discount already covers part of this period.",
          );
        const data = { type, value, startDate, endDate, isActive };
        const record = current
          ? await tx.productDiscount.update({ where: { id: current.id }, data })
          : await tx.productDiscount.create({ data: { ...data, productId } });
        return { ...record, product };
      },
      { isolationLevel: "Serializable" },
    );
    return NextResponse.json(
      { discount },
      { status: discountId === undefined ? 201 : 200 },
    );
  } catch (error) {
    return workflowFailure(error);
  }
}
