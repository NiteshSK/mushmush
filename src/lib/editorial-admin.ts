import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { staffSession } from "./admin";

export async function editorialList(request: NextRequest, kind: "blogs" | "news") {
  if (!(await staffSession("editor")))
    return NextResponse.json({ error: "Editor access required" }, { status: 403 });
  const search = new URL(request.url).searchParams;
  const page = Math.min(1000000, Math.max(1, parseInt(search.get("page") || "1") || 1));
  const limit = Math.min(100, Math.max(1, parseInt(search.get("limit") || "25") || 25));
  const q = (search.get("q") || "").trim().slice(0, 180);
  const status = search.get("status");
  const where = {
    published: status === "published" ? true : status === "draft" ? false : undefined,
    OR: q
      ? [
          { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { excerpt: { contains: q, mode: Prisma.QueryMode.insensitive } },
        ]
      : undefined,
  };
  const sort = search.get("sort");
  const column = sort === "views" || sort === "title" ? sort : "createdAt";
  const direction = search.get("direction") === "asc" ? "asc" : "desc";
  const args = {
    where,
    take: limit,
    skip: (page - 1) * limit,
    orderBy: [{ [column]: direction }, { id: "desc" as const }],
    select: { id: true, title: true, slug: true, published: true, views: true, updatedAt: true },
  };
  const [stories, total] =
    kind === "blogs"
      ? await Promise.all([prisma.blogPost.findMany(args), prisma.blogPost.count({ where })])
      : await Promise.all([
          prisma.news.findMany({ ...args, select: { ...args.select, source: true } }),
          prisma.news.count({ where }),
        ]);
  const totalPages = Math.ceil(total / limit);
  return NextResponse.json({
    [kind]: stories,
    pagination: { page, limit, total, totalPages, pages: totalPages },
  });
}

export async function publishStory(request: NextRequest, id: number, kind: "blogs" | "news") {
  const session = await staffSession("editor");
  if (!session?.user) return NextResponse.json({ error: "Editor access required" }, { status: 403 });
  const { published, expectedUpdatedAt } = await request.json();
  const version = new Date(expectedUpdatedAt);
  if (
    !Number.isSafeInteger(id) ||
    typeof published !== "boolean" ||
    !expectedUpdatedAt ||
    !Number.isFinite(version.getTime())
  ) {
    return NextResponse.json(
      { error: "A publication state and saved version are required." },
      { status: 400 },
    );
  }
  const changed = await prisma.$transaction(async (tx) => {
    const args = { where: { id, updatedAt: version }, data: { published } };
    const result = kind === "blogs" ? await tx.blogPost.updateMany(args) : await tx.news.updateMany(args);
    if (result.count)
      await tx.staffEvent.create({
        data: {
          actorId: session.user.id,
          resource: kind,
          recordId: String(id),
          action: published ? "publish" : "unpublish",
        },
      });
    return result.count;
  });
  return changed
    ? NextResponse.json({ published })
    : NextResponse.json(
        { error: "Another editor changed this story. Reload before publishing." },
        { status: 409 },
      );
}
