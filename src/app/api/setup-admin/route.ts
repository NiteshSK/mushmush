import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { managedStaffMode } from "@/lib/staff-identity";
import { validateEmail, validatePasswordPolicy } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!process.env.ADMIN_SETUP_TOKEN || body?.setupToken !== process.env.ADMIN_SETUP_TOKEN)
    return NextResponse.json({ error: "Owner setup requires a valid setup token." }, { status: 403 });
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name || name.length > 150 || validateEmail(email))
    return NextResponse.json({ error: "Enter a valid name and email." }, { status: 400 });

  const managed = managedStaffMode();
  const operator = managed ? await getCurrentUser() : null;
  let password: string | undefined;
  if (managed) {
    if (!operator?.verifiedStaffWorkspace || operator.email?.toLowerCase() !== email)
      return NextResponse.json({ error: "Sign in with your approved Google Workspace account before setting it up as owner." }, { status: 403 });
  } else {
    if (typeof body.password !== "string" || Buffer.byteLength(body.password) > 72)
      return NextResponse.json({ error: "Enter a password of up to 72 bytes." }, { status: 400 });
    const policy = validatePasswordPolicy(body.password);
    if (!policy.valid) return NextResponse.json({ error: policy.error }, { status: 400 });
    password = await bcrypt.hash(body.password, 12);
  }

  try {
    return await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(742501)::text`;
      if (await tx.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } }))
        return NextResponse.json({ error: "Owner setup is complete." }, { status: 409 });
      const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
      const select = { id:true, name:true, email:true, role:true };
      if (managed && (!existing || existing.id !== operator?.id))
        return NextResponse.json({ error: "Sign in with the account being enrolled." }, { status: 403 });
      if (!managed && existing) return NextResponse.json({ error: "That email already has an account." }, { status: 409 });
      const user = managed && existing
        ? await tx.user.update({ where: { id: existing.id }, data: { role: "ADMIN", name }, select })
        : await tx.user.create({ data: { name, email, role: "ADMIN", password }, select });
      await tx.staffEvent.create({ data: { actorId:user.id, resource:"user", recordId:user.id, action:"owner-provisioned" } });
      return NextResponse.json({ user, message:"Owner created." }, { status:201 });
    });
  } catch {
    return NextResponse.json({error:"Owner setup could not be completed."}, {status:500});
  }
}
export async function GET() {
  const owner = await prisma.user.findFirst({ where: { role:"ADMIN" }, select: { id:true } });
  return NextResponse.json({ setupRequired: !owner && Boolean(process.env.ADMIN_SETUP_TOKEN), hasAdmin:Boolean(owner), managedGoogle:managedStaffMode() },{headers:{"Cache-Control":"no-store"}});
}
