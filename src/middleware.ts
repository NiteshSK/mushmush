import { NextRequest, NextResponse } from "next/server";

/** Old and alternative domains whose pages move permanently to the main domain (src/lib/site.ts). */
const MAIN_HOST = "www.kosvana.com";
const MOVED_HOSTS = new Set(["mushmush.in", "www.mushmush.in", "kosvana.com"]);

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase().replace(/:\d+$/, "");
  const { pathname, search } = request.nextUrl;

  // One address per page for search engines. API routes are left alone, so sign-in callbacks and
  // payment webhooks that still point at an old domain keep working.
  if (MOVED_HOSTS.has(host) && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(`https://${MAIN_HOST}${pathname}${search}`, 308);
  }

  if (pathname.startsWith("/admin")) {
    const headers = new Headers(request.headers);
    headers.set("x-kosvana-admin-path", pathname + search);
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

// Pages only: skip Next.js assets and files with an extension (images, fonts, robots.txt, sitemap.xml).
export const config = { matcher: ["/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"] };
