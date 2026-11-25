import { NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await staffSession("finance")))
    return new Response(null, { status: 403 });
  const proof = await prisma.paymentProof.findUnique({
    where: { paymentId: (await params).id },
  });
  if (!proof)
    return NextResponse.json({ error: "No proof attached" }, { status: 404 });
  return new Response(new Uint8Array(proof.data), {
    headers: {
      "Content-Type": proof.mime,
      "Cache-Control": "private, no-store",
      "Content-Disposition": "attachment",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
