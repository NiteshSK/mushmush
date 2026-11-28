import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { availablePacks, formatBulkQuantity } from "@/lib/inventory";
import { activeDiscountsInclude, computeProductDiscount } from "@/lib/product-pricing";

/**
 * Storefront products as /api/products serves them: not archived, with the active discount,
 * stock in packs and the review average. Server pages and the API both use this, so the
 * price a crawler reads in the first HTML is the price the shopper sees and pays.
 */

/** Products added within this many days are tagged "New". */
const NEW_FOR_DAYS = 14;

const baseInclude = {
  categories: { include: { category: true } },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude;

const includeWithDiscounts = (now: Date) => ({ ...baseInclude, discounts: activeDiscountsInclude(now) });

type ProductRow = Prisma.ProductGetPayload<{ include: ReturnType<typeof includeWithDiscounts> }>;

export type CatalogueQuery = {
  /** Extra filters. Archived products are always left out. */
  where?: Prisma.ProductWhereInput;
  skip?: number;
  take?: number;
};

async function findRows(where: Prisma.ProductWhereInput, skip: number | undefined, take: number | undefined, now: Date): Promise<ProductRow[]> {
  const query = { where, skip, take, orderBy: { createdAt: "desc" as const } };
  try {
    return await prisma.product.findMany({ ...query, include: includeWithDiscounts(now) });
  } catch {
    // Fallback for a database without the discounts table: list price only.
    const rows = await prisma.product.findMany({ ...query, include: baseInclude });
    return rows.map(row => ({ ...row, discounts: [] }));
  }
}

/** One database row in the /api/products response shape. */
export function toCatalogueProduct(product: ProductRow, now: Date = new Date()) {
  const newThreshold = new Date(now);
  newThreshold.setDate(newThreshold.getDate() - NEW_FOR_DAYS);
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  // Discounted price ONLY if an active discount record exists (src/lib/product-pricing.ts).
  const { discountedPrice, discountPercentage } = computeProductDiscount(product.price, product.discounts);
  const stockQuantity = product.inStock ? availablePacks(product.quantity, product.measurementValue, product.measurementType) : 0;
  return {
    ...product,
    averageRating,
    reviewCount: product.reviews.length,
    inStock: stockQuantity > 0,
    isOutOfStock: stockQuantity === 0,
    stockQuantity,
    bulkQuantity: product.quantity,
    bulkDisplay: formatBulkQuantity(product.quantity, product.measurementType),
    discountedPrice,
    discountPercentage: Math.round(discountPercentage),
    hasDiscount: discountedPrice !== null,
    isNew: product.createdAt >= newThreshold,
  };
}

export type CatalogueProduct = ReturnType<typeof toCatalogueProduct>;

/** A page of storefront products, newest first, with the total that match. */
export async function listCatalogueProducts({ where = {}, skip, take }: CatalogueQuery = {}) {
  const now = new Date();
  const filter: Prisma.ProductWhereInput = { ...where, archivedAt: null };
  const [rows, total] = await Promise.all([findRows(filter, skip, take, now), prisma.product.count({ where: filter })]);
  return { products: rows.map(row => toCatalogueProduct(row, now)), total };
}

/** One storefront product by slug, or null when it does not exist or is archived. */
export async function findCatalogueProduct(slug: string): Promise<CatalogueProduct | null> {
  const now = new Date();
  const [row] = await findRows({ slug, archivedAt: null }, undefined, 1, now);
  return row ? toCatalogueProduct(row, now) : null;
}
