import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { availablePacks, formatBulkQuantity } from "@/lib/inventory";
import {
  activeDiscountsInclude,
  computeProductDiscount,
} from "@/lib/product-pricing";
import { changeInventory } from "@/lib/staff-inventory";
import { workflowFailure } from "@/lib/staff-workflow";

export async function GET(request: NextRequest) {
  if (!(await staffSession("fulfillment")))
    return NextResponse.json(
      { error: "Fulfillment access required." },
      { status: 403 },
    );
  const params = request.nextUrl.searchParams;
  const paginated = params.has("page");
  const page = Math.min(
    100000,
    Math.max(1, Math.floor(Number(params.get("page"))) || 1),
  );
  const limit = Math.min(
    100,
    Math.max(1, Math.floor(Number(params.get("limit"))) || 25),
  );
  const search = params.get("q")?.trim().slice(0, 100);
  const category = params.get("category");
  const conditions = [Prisma.sql`p."archivedAt" IS NULL`];
  const packs = Prisma.sql`COALESCE(FLOOR(p.quantity / NULLIF(p."measurementValue"::double precision *
    CASE WHEN lower(p."measurementType") IN ('kg','l','litre','litres') THEN 1000 ELSE 1 END,0)),0)`;
  if (search) {
    const pattern = "%" + search.replace(/[\\%_]/g, "\\$&") + "%";
    conditions.push(Prisma.sql`(p.title ILIKE ${pattern} OR EXISTS (
      SELECT 1 FROM product_categories pc JOIN categories c ON c.id=pc."categoryId" WHERE pc."productId"=p.id AND c.title ILIKE ${pattern}))`);
  }
  if (category)
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON pc."categoryId"=c.id WHERE pc."productId"=p.id AND c.slug=${category})`,
    );
  if (params.get("attention") === "1")
    conditions.push(Prisma.sql`(NOT p."inStock" OR ${packs} <= 5)`);
  if (params.get("stock") === "in" || params.get("stock") === "out")
    conditions.push(Prisma.sql`p."inStock"=${params.get("stock") === "in"}`);
  if (params.get("featured") === "1") conditions.push(Prisma.sql`p.featured`);
  if (params.get("discount") === "1")
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM product_discounts d WHERE d."productId"=p.id AND d."isActive" AND d."startDate"<=now() AND (d."endDate" IS NULL OR d."endDate">=now()))`,
    );
  const sorted = {
    price: Prisma.sql`p.price`,
    title: Prisma.sql`p.title`,
    stock: packs,
    createdAt: Prisma.sql`p."createdAt"`,
  };
  const key = params.get("sort");
  const order =
    key && Object.prototype.hasOwnProperty.call(sorted, key)
      ? sorted[key as keyof typeof sorted]
      : sorted.createdAt;
  const direction =
    params.get("direction") === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const where = Prisma.join(conditions, " AND ");
  const paging = paginated
    ? Prisma.sql`LIMIT ${limit} OFFSET ${(page - 1) * limit}`
    : Prisma.empty;
  const [ids, count] = await Promise.all([
    prisma.$queryRaw<
      { id: number }[]
    >`SELECT p.id FROM products p WHERE ${where} ORDER BY ${order} ${direction},p.id ${paging}`,
    paginated
      ? prisma.$queryRaw<
          { total: number }[]
        >`SELECT count(*)::int AS total FROM products p WHERE ${where}`
      : Promise.resolve([]),
  ]);
  const productIds = ids.map((row) => row.id);
  const [items, ratings] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, archivedAt: null },
      include: {
        categories: { include: { category: true } },
        discounts: activeDiscountsInclude(),
      },
    }),
    prisma.review.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
      _count: true,
    }),
  ]);
  const summary = new Map(ratings.map((row) => [row.productId, row]));
  const byId = new Map(
    items.map((product) => {
      const rating = summary.get(product.id);
      const discount = computeProductDiscount(product.price, product.discounts);
      return [
        product.id,
        {
          ...product,
          bulkQuantity: product.quantity,
          bulkDisplay: formatBulkQuantity(
            product.quantity,
            product.measurementType,
          ),
          stockQuantity: availablePacks(
            product.quantity,
            product.measurementValue,
            product.measurementType,
          ),
          reviewCount: rating?._count ?? 0,
          averageRating: rating?._avg.rating ?? 0,
          hasActiveDiscount: discount.discountedPrice !== null,
          activeDiscountValue: discount.discountPercentage,
          categoryNames: product.categories.map((item) => item.category.title),
        },
      ] as const;
    }),
  );
  const products = productIds.flatMap((id) =>
    byId.has(id) ? [byId.get(id)!] : [],
  );
  const total = count[0]?.total ?? products.length;
  return NextResponse.json(
    paginated
      ? {
          products,
          total,
          page,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        }
      : products,
  );
}

export async function PATCH(request: NextRequest) {
  const session = await staffSession("fulfillment");
  if (!session)
    return NextResponse.json(
      { error: "Fulfillment access required." },
      { status: 403 },
    );
  try {
    const { productId, inStock, expectedUpdatedAt } = await request.json();
    const product = await changeInventory(
      productId,
      { field: "inStock", value: inStock, expectedUpdatedAt },
      session.user.id,
    );
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return workflowFailure(error);
  }
}
