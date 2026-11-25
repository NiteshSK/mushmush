import { NextRequest, NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { WorkflowError, workflowFailure } from "@/lib/staff-workflow";
import { FREE_SHIPPING_THRESHOLD, isValidPincode } from "@/lib/shipping";

type ZoneValues = {
  name: string;
  pincodeFrom: string;
  pincodeTo: string;
  baseFee: number;
  estimatedDays: string | null;
  isActive: boolean;
  priority: number;
};
function validate(body: ZoneValues & { freeAbove?: number | null }) {
  if (
    typeof body.name !== "string" ||
    !body.name.trim() ||
    body.name.length > 120
  )
    throw new WorkflowError("Enter a zone name.", 400);
  if (
    !isValidPincode(body.pincodeFrom) ||
    !isValidPincode(body.pincodeTo) ||
    body.pincodeFrom > body.pincodeTo
  )
    throw new WorkflowError("Enter an ordered range of six-digit PINs.", 400);
  if (
    !Number.isFinite(body.baseFee) ||
    body.baseFee < 0 ||
    !Number.isSafeInteger(body.priority)
  )
    throw new WorkflowError("Check the surcharge and priority.", 400);
  if (
    typeof body.isActive !== "boolean" ||
    (body.estimatedDays != null &&
      (typeof body.estimatedDays !== "string" ||
        body.estimatedDays.length > 60))
  )
    throw new WorkflowError("Invalid delivery estimate or state.", 400);
  if (body.freeAbove != null && body.freeAbove !== FREE_SHIPPING_THRESHOLD)
    throw new WorkflowError(
      "Free shipping uses the store-wide threshold.",
      400,
    );
  return {
    name: body.name.trim(),
    pincodeFrom: body.pincodeFrom,
    pincodeTo: body.pincodeTo,
    baseFee: body.baseFee,
    estimatedDays: body.estimatedDays?.trim() || null,
    isActive: body.isActive,
    priority: body.priority,
  };
}
export async function GET() {
  if (!(await staffSession("owner")))
    return NextResponse.json(
      { error: "Owner access required." },
      { status: 403 },
    );
  const zones = await prisma.shippingZone.findMany({
    orderBy: [{ priority: "desc" }, { id: "asc" }],
  });
  return NextResponse.json({
    zones: zones.map((zone) => ({
      ...zone,
      freeAbove: FREE_SHIPPING_THRESHOLD,
    })),
  });
}
async function save(request: NextRequest) {
  const session = await staffSession("owner");
  if (!session)
    return NextResponse.json(
      { error: "Owner access required." },
      { status: 403 },
    );
  try {
    const body = await request.json();
    const zone = await prisma.$transaction(async (tx) => {
      let updated;
      if (request.method === "POST") {
        updated = await tx.shippingZone.create({
          data: validate({ priority: 0, isActive: true, ...body }),
        });
      } else {
        if (
          !Number.isSafeInteger(body.id) ||
          typeof body.expectedUpdatedAt !== "string"
        )
          throw new WorkflowError("Reload the zone before editing it.", 409);
        const current = await tx.shippingZone.findUnique({
          where: { id: body.id },
        });
        if (!current) throw new WorkflowError("Zone no longer exists.", 404);
        const result = await tx.shippingZone.updateMany({
          where: { id: body.id, updatedAt: new Date(body.expectedUpdatedAt) },
          data: validate({ ...current, ...body, freeAbove: body.freeAbove }),
        });
        if (!result.count)
          throw new WorkflowError("This zone changed. Reload before saving.");
        updated = await tx.shippingZone.findUniqueOrThrow({
          where: { id: body.id },
        });
      }
      await tx.staffEvent.create({
        data: {
          actorId: session.user.id,
          resource: "shipping-zone",
          recordId: String(updated.id),
          action: request.method === "POST" ? "create" : "update",
          note: updated.name,
        },
      });
      return updated;
    });
    return NextResponse.json(
      { zone: { ...zone, freeAbove: FREE_SHIPPING_THRESHOLD } },
      { status: request.method === "POST" ? 201 : 200 },
    );
  } catch (error) {
    return workflowFailure(error);
  }
}
export const POST = save;
export const PUT = save;

export async function DELETE(request: NextRequest) {
  const session = await staffSession("owner");
  if (!session)
    return NextResponse.json(
      { error: "Owner access required." },
      { status: 403 },
    );
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0)
    return NextResponse.json({ error: "Invalid zone." }, { status: 400 });
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.shippingZone.updateMany({
        where: { id, isActive: true },
        data: { isActive: false },
      });
      if (updated.count)
        await tx.staffEvent.create({
          data: {
            actorId: session.user.id,
            resource: "shipping-zone",
            recordId: String(id),
            action: "disable",
          },
        });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return workflowFailure(error);
  }
}
