import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json({
      ok: true,
      session,
      hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
      hasGoogle:
        Boolean(process.env.GOOGLE_CLIENT_ID) &&
        Boolean(process.env.GOOGLE_CLIENT_SECRET),
      env: process.env.NODE_ENV,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
