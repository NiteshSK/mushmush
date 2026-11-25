import { NextResponse, type NextRequest } from "next/server";

// /signin was an unused copy of the sign-in form. Send old links to /auth/signin with a real
// redirect (no legacy header flashes first) and keep the query, such as callbackUrl.
export function GET(request: NextRequest) {
  const target = request.nextUrl.clone();
  target.pathname = "/auth/signin";
  return NextResponse.redirect(target, 307);
}
