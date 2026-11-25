import { NextResponse, type NextRequest } from "next/server";

// /signup was an unused copy of the sign-up form. Send old links to /auth/signup with a real
// redirect (no legacy header flashes first) and keep the query, such as callbackUrl.
export function GET(request: NextRequest) {
  const target = request.nextUrl.clone();
  target.pathname = "/auth/signup";
  return NextResponse.redirect(target, 307);
}
