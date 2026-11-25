import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { VISIT_IDLE_MINUTES } from "./visit-analytics";

export const visitRanges = { "1": "Last 24 hours", "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" };

export const visitStages = {
  product: { label: "Viewed a product", event: { kind: "page", path: { startsWith: "/shop-details/" } } },
  bag: { label: "Added to bag", event: { kind: "bag_add" } },
  checkout: { label: "Reached checkout", event: { kind: "page", path: "/checkout" } },
  submitted: { label: "Submitted payment", event: { kind: "payment_submitted" } },
} satisfies Record<string, { label: string; event: Prisma.StorefrontVisitEventWhereInput }>;

export type VisitFilters = { range: keyof typeof visitRanges; stage: keyof typeof visitStages | ""; q: string; page: number };
const pageSize = 20;

export function filtersFrom(query: Record<string, string | string[] | undefined>): VisitFilters {
  const range = typeof query.range === "string" && Object.hasOwn(visitRanges, query.range)
    ? query.range as VisitFilters["range"] : "7";
  const stage = typeof query.stage === "string" && Object.hasOwn(visitStages, query.stage)
    ? query.stage as VisitFilters["stage"] : "";
  const page = typeof query.page === "string" ? Number(query.page) : 1;
  return {
    range, stage, page: Number.isSafeInteger(page) && page > 0 ? Math.min(10_000, page) : 1,
    q: typeof query.q === "string" ? query.q.trim().slice(0, 100) : "",
  };
}

export function analyticsHref(filters: VisitFilters, id?: string) {
  const query = new URLSearchParams();
  if (filters.range !== "7") query.set("range", filters.range);
  if (filters.stage) query.set("stage", filters.stage);
  if (filters.q) query.set("q", filters.q);
  if (filters.page > 1) query.set("page", String(filters.page));
  return "/admin/analytics" + (id ? "/" + encodeURIComponent(id) : "") + (query.size ? "?" + query : "");
}

const person = { select: { name: true, email: true } } as const;
const summaryFields = {
  id: true, user: person, source: true, entryPath: true, lastPath: true, startedAt: true, lastSeenAt: true,
} satisfies Prisma.StorefrontVisitSelect;

export async function readAnalytics(filters: VisitFilters) {
  const since = new Date(Date.now() - Number(filters.range) * 86_400_000);
  const inactiveSince = new Date(Date.now() - VISIT_IDLE_MINUTES * 60_000);
  const inRange = { startedAt: { gte: since } };
  const where: Prisma.StorefrontVisitWhereInput = { ...inRange };
  if (filters.stage) where.events = { some: visitStages[filters.stage].event };
  if (filters.q) {
    const term = filters.q.replace(/[\\%_]/g, "\\$&");
    const contains = { contains: term, mode: "insensitive" } as const;
    where.OR = [{ user: { name: contains } }, { user: { email: contains } }];
    const id = filters.q.replace(/^guest\s*·?\s*/i, "");
    if (/^[a-f0-9]{3,32}$/i.test(id)) where.OR.push({ id: { startsWith: id.toLowerCase() } });
  }
  const [total, matched, funnel, topEntries, topStops] = await Promise.all([
    prisma.storefrontVisit.count({ where: inRange }),
    where.events || where.OR ? prisma.storefrontVisit.count({ where }) : Promise.resolve(undefined),
    Promise.all((["product", "bag", "checkout", "submitted"] as const).map(stage =>
      prisma.storefrontVisit.count({ where: { ...inRange, events: { some: visitStages[stage].event } } }))),
    prisma.storefrontVisit.groupBy({ by: ["entryPath"], where: inRange, _count: { entryPath: true },
      orderBy: [{ _count: { entryPath: "desc" } }, { entryPath: "asc" }], take: 5 }),
    prisma.storefrontVisit.groupBy({ by: ["lastPath"], where: { ...inRange, lastSeenAt: { lt: inactiveSince } },
      _count: { lastPath: true }, orderBy: [{ _count: { lastPath: "desc" } }, { lastPath: "asc" }], take: 5 }),
  ] as const);
  const [viewed, bag, checkout, submitted] = funnel;
  const count = matched ?? total;
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const page = Math.min(filters.page, pages);
  const visits = await prisma.storefrontVisit.findMany({
    where, select: summaryFields, orderBy: [{ lastSeenAt: "desc" }, { id: "asc" }],
    skip: (page - 1) * pageSize, take: pageSize,
  });
  return { total, count, viewed, bag, checkout, submitted, topEntries, topStops, page, pages, visits, inactiveSince };
}

export async function readVisit(id: string) {
  if (!/^[a-z0-9]{32}$/.test(id)) return null;
  return prisma.storefrontVisit.findUnique({
    where: { id }, select: { ...summaryFields, events: { orderBy: { sequence: "asc" } } },
  });
}
