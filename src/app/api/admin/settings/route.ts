import { DEFAULT_SETTINGS } from "@/lib/shop-settings";
import { staffSession } from "@/lib/admin";
import { WorkflowError, workflowFailure } from "@/lib/staff-workflow";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    if (!(await staffSession("owner"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.globalConfig.findMany({
      where: {
        key: {
          in: [
            ...DEFAULT_SETTINGS.map((row) => row.key),
            "fresh_delivery_pins",
          ],
        },
      },
      select: { key: true, value: true, updatedAt: true },
      orderBy: { key: "asc" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const user = (await staffSession("owner"))?.user;
  if (!user)
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  try {
    const { settings } = await req.json();
    if (!Array.isArray(settings) || !settings.length || settings.length > 12)
      throw new WorkflowError("Invalid settings.", 400);
    await prisma.$transaction(async (tx) => {
      for (const change of settings) {
        const { key, value, expected, expectedUpdatedAt } = change;
        const definition = DEFAULT_SETTINGS.find((s) => s.key === key);
        if (
          (!definition && key !== "fresh_delivery_pins") ||
          typeof value !== "string" ||
          value.length > 1200 ||
          (expected !== null && typeof expected !== "string")
        )
          throw new WorkflowError("Invalid setting.", 400);
        if (key === "fresh_delivery_pins" && !/^\d{6}(,\d{6})*$/.test(value))
          throw new WorkflowError("Enter comma-separated six-digit PINs.", 400);
        if (
          key === "contact_email" &&
          !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
        )
          throw new WorkflowError("Enter a contact email address.", 400);
        if (
          value &&
          (key.endsWith("_url") || key === "google_maps_link") &&
          !/^https?:\/\//i.test(value)
        )
          throw new WorkflowError("Enter a full website URL.", 400);
        if (["company_name", "company_address"].includes(key) && !value.trim())
          throw new WorkflowError(
            "Company name and address cannot be empty.",
            400,
          );
        if (
          ["contact_phone", "whatsapp_number"].includes(key) &&
          (!/^\+?[0-9 -]+$/.test(value) ||
            !/^\d{10,15}$/.test(value.replace(/\D/g, "")))
        )
          throw new WorkflowError(
            "Enter a phone number with country code.",
            400,
          );
        if (
          expected !== null &&
          (!expectedUpdatedAt ||
            !Number.isFinite(Date.parse(expectedUpdatedAt)))
        )
          throw new WorkflowError("Reload these settings before saving.", 409);
        if (expected === null)
          await tx.globalConfig.create({
            data: { key, value, group: definition?.group || "delivery" },
          });
        else if (
          !(
            await tx.globalConfig.updateMany({
              where: {
                key,
                value: expected,
                updatedAt: new Date(expectedUpdatedAt),
              },
              data: { value },
            })
          ).count
        )
          throw new WorkflowError(
            "Settings changed in another tab. Reload before saving.",
          );
        await tx.staffEvent.create({
          data: {
            actorId: user.id,
            resource: "settings",
            recordId: key,
            action: "update",
          },
        });
      }
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return workflowFailure(e);
  }
}
