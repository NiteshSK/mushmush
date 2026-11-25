import { createHmac } from "node:crypto";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { VISIT_CONSENT, VISIT_IDLE_MINUTES, visitEvent } from "@/lib/visit-analytics";

const noContent = () => new NextResponse(null, { status: 204 });
const reject = (status: number) => new NextResponse(null, { status });

async function readEvent(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(text + decoder.decode());
      size += value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  if (request.cookies.get(VISIT_CONSENT)?.value !== "allow" ||
      request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1") return noContent();
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return reject(403);
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol) || url.host !== request.headers.get("host")) return reject(403);
  } catch { return reject(403); }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) || "local";
  const budget = rateLimit("storefront-visit:" + ip, { max: 150, windowSeconds: 60 });
  if (!budget.allowed) return reject(429);
  const event = visitEvent(await readEvent(request));
  if (!event) return reject(400);
  const secret = authOptions.secret;
  if (!secret) return reject(503);

  try {
    // Read the cookie without refreshing the sign-in session on a passive background visit request.
    const token = await getToken({ req: request, secret, secureCookie: process.env.NODE_ENV === "production" });
    const account = token?.sub ? await prisma.user.findUnique({ where: { id: token.sub }, select: { id: true, role: true } }) : null;
    if (account && account.role !== "CUSTOMER") return noContent();
    const userId = account?.id ?? null;
    const id = createHmac("sha256", secret).update("storefront-visit:" + event.id).digest("hex").slice(0, 32);
    const cutoff = new Date(Date.now() - VISIT_IDLE_MINUTES * 60_000 - 60_000);
    const recorded = await prisma.$transaction(async tx => {
      const [visit] = await tx.$queryRaw<{ id: string }[]>`
        INSERT INTO storefront_visits (id, "userId", source, "entryPath", "lastPath", "startedAt", "lastSeenAt", "firstIndex", "lastIndex")
        VALUES (${id}, ${userId}, ${event.source}, ${event.path}, ${event.path},
          timezone('UTC', ${event.at}::timestamptz), timezone('UTC', ${event.at}::timestamptz), ${event.sequence}, ${event.sequence})
        ON CONFLICT (id) DO UPDATE SET
          "userId" = COALESCE(storefront_visits."userId", excluded."userId"),
          "entryPath" = CASE WHEN excluded."firstIndex" < storefront_visits."firstIndex" THEN excluded."entryPath" ELSE storefront_visits."entryPath" END,
          "firstIndex" = LEAST(storefront_visits."firstIndex", excluded."firstIndex"),
          "startedAt" = LEAST(storefront_visits."startedAt", excluded."startedAt"),
          "lastPath" = CASE WHEN excluded."lastIndex" > storefront_visits."lastIndex" THEN excluded."lastPath" ELSE storefront_visits."lastPath" END,
          "lastIndex" = GREATEST(storefront_visits."lastIndex", excluded."lastIndex"),
          "lastSeenAt" = GREATEST(storefront_visits."lastSeenAt", excluded."lastSeenAt")
        WHERE (storefront_visits."userId" IS NULL OR storefront_visits."userId" = excluded."userId")
          AND storefront_visits."lastSeenAt" >= timezone('UTC', ${cutoff}::timestamptz)
        RETURNING id
      `;
      if (!visit) return false;
      if (event.kind !== "presence") await tx.storefrontVisitEvent.createMany({
        data: { visitId: visit.id, sequence: event.sequence, kind: event.kind, path: event.path, detail: event.detail, observedAt: event.at },
        skipDuplicates: true,
      });
      return true;
    });
    return recorded ? noContent() : reject(409);
  } catch {
    return reject(503);
  }
}
