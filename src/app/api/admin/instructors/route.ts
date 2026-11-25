import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staffSession } from "@/lib/admin";
export async function GET() {
  if (!(await staffSession("trainer")))
    return NextResponse.json(
      { error: "Staff access required" },
      { status: 403 },
    );
  return NextResponse.json(
    await prisma.instructor.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  );
}
