import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { managedStaffMode } from "@/lib/staff-identity";
import { readGrant } from "@/lib/staff-permissions";
import { validateEmail, validatePasswordPolicy } from "@/lib/validation";

const fields = { id: true, name: true, email: true, role: true, staffDuties: true, emailVerified: true, updatedAt: true, createdAt: true };
const failure = (error: string, status: number) => NextResponse.json({ error }, { status });

function databaseFailure(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return failure("This email already has an account.", 409);
  return failure("People could not be updated. Try again.", 500);
}

export async function GET(request: NextRequest) {
  const owner = await getCurrentUser();
  if (owner?.role !== "ADMIN") return failure("Owner access required.", owner ? 403 : 401);
  const params = request.nextUrl.searchParams;
  const page = Number(params.get("page") || 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) return failure("Invalid page.", 400);
  const term = (params.get("q") || "").trim().slice(0, 150);
  const group = params.get("group") || "all";
  const where: Prisma.UserWhereInput = {};
  if (group === "staff") where.role = { in: ["STAFF", "ADMIN"] };
  else if (group === "customer") where.role = "CUSTOMER";
  else if (group !== "all") return failure("Invalid group.", 400);
  if (term) where.OR = [{ name: { contains: term, mode: "insensitive" } }, { email: { contains: term, mode: "insensitive" } }];
  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: fields, orderBy: [{ createdAt: "desc" }, { id: "asc" }], skip: (page - 1) * 25, take: 25 }),
    prisma.user.count({ where })
  ]);
  return NextResponse.json({ rows, total, pages: Math.max(1, Math.ceil(total / 25)), managedGoogle: managedStaffMode() }, { headers: { "Cache-Control": "no-store" } });
}

async function save(request: NextRequest, create: boolean) {
  const owner = await getCurrentUser();
  if (owner?.role !== "ADMIN") return failure("Owner access required.", owner ? 403 : 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return failure("Enter valid account details.", 400);
  if (!create && (typeof body.id !== "string" || !body.id)) return failure("Choose an account.", 400);
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  if ((create || body.name !== undefined) && (!name || name.length > 150)) return failure("Enter a name of 1–150 characters.", 400);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (create && (!email || email.length > 254 || validateEmail(email))) return failure("Enter a valid email address.", 400);
  let password: string | undefined;
  if (create || body.password) {
    if (typeof body.password !== "string" || Buffer.byteLength(body.password) > 72) return failure("Enter a valid password of up to 72 bytes.", 400);
    const policy = validatePasswordPolicy(body.password);
    if (!policy.valid) return failure(policy.error || "Enter a stronger password.", 400);
    password = await bcrypt.hash(body.password, 12);
  }
  try {
    return await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(742501)::text`;
      const actor = await tx.user.findUnique({ where: { id: owner.id }, select: { role: true } });
      if (actor?.role !== "ADMIN") return failure("Owner access has been revoked.", 403);
      const existing = create ? null : await tx.user.findUnique({ where: { id: body.id }, select: fields });
      if (!create && !existing) return failure("Account unavailable.", 404);
      if (existing && body.updatedAt && existing.updatedAt.toISOString() !== body.updatedAt) return failure("This account changed. Reopen it to review the current permissions.", 409);
      const grant = readGrant(body.role ?? existing?.role ?? "CUSTOMER", body.staffDuties ?? existing?.staffDuties);
      if (!grant) return failure("Choose a valid role and at least one duty for staff.", 400);
      if (managedStaffMode() && grant.role !== "CUSTOMER") {
        const address = existing?.email || email;
        const domain = process.env.STAFF_GOOGLE_DOMAIN?.trim().toLowerCase();
        if (!domain || address.slice(address.lastIndexOf("@") + 1).toLowerCase() !== domain)
          return failure("Staff access requires an email in the configured Google Workspace domain.", 400);
        const linked = existing && await tx.account.findFirst({ where: { userId: existing.id, provider: "google" }, select: { id: true } });
        if (!linked) return failure("Have this person sign in with their Workspace Google account first. Then grant access to that existing account.", 409);
      }
      if (existing?.id === owner.id && grant.role !== "ADMIN") return failure("Another owner must change your access.", 409);
      const data = { ...grant, name, password };
      const row = existing
        ? await tx.user.update({ where: { id: existing.id }, data, select: fields })
        : await tx.user.create({ data: { ...data, email }, select: fields });
      await tx.staffEvent.create({ data: {
        actorId: owner.id, resource: "user", recordId: row.id, action: create ? "created" : "updated",
        note: JSON.stringify({ previous: existing && { role: existing.role, duties: existing.staffDuties }, current: grant, passwordUpdated: Boolean(password) })
      } });
      return NextResponse.json(row, { status: create ? 201 : 200 });
    });
  } catch (error) {
    return databaseFailure(error);
  }
}
export function POST(request: NextRequest) { return save(request, true); }
export function PATCH(request: NextRequest) { return save(request, false); }
