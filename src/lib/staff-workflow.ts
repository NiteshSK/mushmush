import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export class WorkflowError extends Error {
  constructor(
    message: string,
    readonly status = 409,
  ) {
    super(message);
  }
}
export function workflowFailure(error: unknown) {
  if (error instanceof WorkflowError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P2002", "P2025", "P2034"].includes(error.code)
  )
    return NextResponse.json(
      { error: "The record changed. Refresh and review it again." },
      { status: 409 },
    );
  console.error(
    "Staff operation failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return NextResponse.json(
    { error: "The operation could not be completed." },
    { status: 500 },
  );
}

export async function decideTraining(input: {
  registrationId?: string;
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  approve: boolean;
  actor: string;
  note?: string;
  allowCreate?: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    const lookup = input.paymentId
      ? { id: input.paymentId }
      : input.transactionId
        ? { transactionId: input.transactionId }
        : null;
    if (!lookup) throw new WorkflowError("Select a payment reference.", 400);
    const named =
      input.registrationId ||
      (
        await tx.upi_payments.findUnique({
          where: lookup,
          select: { trainingRegistrationId: true },
        })
      )?.trainingRegistrationId;
    if (!named)
      throw new WorkflowError("Training payment could not be matched.", 404);
    const id = named;
    await tx.$queryRaw`SELECT id FROM training_registrations WHERE id = ${id} FOR UPDATE`;
    const attempt = await tx.upi_payments.findUnique({ where: lookup });
    if (attempt && attempt.trainingRegistrationId !== id)
      throw new WorkflowError("Payment belongs to a different registration.");
    if (!attempt && (!input.allowCreate || input.paymentId))
      throw new WorkflowError("Payment not found.", 404);
    const reg = await tx.trainingRegistration.findUnique({
      where: { id },
      select: {
        id: true,
        registrationNumber: true,
        totalAmount: true,
        status: true,
      },
    });
    if (!reg) throw new WorkflowError("Registration could not be found.", 404);
    if (
      attempt?.transactionId &&
      input.transactionId &&
      attempt.transactionId !== input.transactionId
    )
      throw new WorkflowError("The payment reference has changed.");
    if (
      (input.amount !== undefined &&
        (!Number.isFinite(input.amount) ||
          Math.abs(input.amount - reg.totalAmount) > 0.01)) ||
      (attempt && Math.abs(attempt.amount - reg.totalAmount) > 0.01)
    )
      throw new WorkflowError("Payment amount does not match registration.");
    const status = input.approve ? "VERIFIED" : "FAILED";
    if (attempt?.status === status) return reg;
    if (
      (input.approve &&
        !["PENDING", "PAYMENT_RECEIVED"].includes(reg.status)) ||
      (attempt && attempt.status !== "PENDING")
    )
      throw new WorkflowError(
        "This registration or payment has already been decided.",
      );
    if (
      input.approve &&
      (await tx.upi_payments.findFirst({
        where: { trainingRegistrationId: id, status: "VERIFIED" },
        select: { id: true },
      }))
    )
      throw new WorkflowError(
        "This registration already has a verified payment.",
      );
    const decision = {
      status,
      decisionNotes: input.note?.slice(0, 1000),
      verifiedByUserId: input.actor === "webhook" ? null : input.actor,
      updatedAt: new Date(),
    } as const;
    if (attempt) {
      const result = await tx.upi_payments.updateMany({
        where: { id: attempt.id, status: "PENDING" },
        data: decision,
      });
      if (!result.count)
        throw new WorkflowError("This payment has already changed.");
    } else {
      if (!input.transactionId)
        throw new WorkflowError("Payment reference required.", 400);
      await tx.upi_payments.create({
        data: {
          ...decision,
          id: crypto.randomUUID(),
          trainingRegistrationId: id,
          resourceType: "training_registration",
          amount: reg.totalAmount,
          transactionId: input.transactionId,
        },
      });
    }
    await tx.staffEvent.create({
      data: {
        actorId: input.actor,
        resource: "registration",
        recordId: id,
        action: status,
        note: decision.decisionNotes,
      },
    });
    if (!input.approve) return reg;
    const confirmed = await tx.trainingRegistration.update({
      where: { id },
      data: { status: "CONFIRMED" },
      select: {
        id: true,
        registrationNumber: true,
        status: true,
        totalAmount: true,
      },
    });
    await tx.staffJob.upsert({
      where: { key: "training/" + id },
      create: {
        key: "training/" + id,
        resourceId: id,
        kind: "training",
        action: "CONFIRMED",
      },
      update: {},
    });
    return confirmed;
  });
}
