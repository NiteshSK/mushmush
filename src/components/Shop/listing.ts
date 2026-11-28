/**
 * The shop listing rules (categories, sort, pages) without React, so the server page and the
 * client component pick the same products for the same URL. No "use client": the server page
 * imports it to build structured data for the visible products.
 */
import type { Product } from "@/types/product";
import { GROW_CATEGORY, isFreshMushroom, isGrowProduct, sentenceCase } from "../Pantry/catalogue";

export const PRODUCTS_PER_PAGE = 12;

export const sorts = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
] as const;
export type Sort = typeof sorts[number]["value"];

// Shopping categories first; mushroom categories after them.
const categoryOrder = ["spices", "dry-fruits", "seeds", "edible", "medicinal", "powders", "tinctures"];

export type CategoryOption = { slug: string; title: string; count: number; freshOnly: boolean };

const mushroomSlugs = ["edible", "medicinal", "powders", "tinctures"];
export const isMushroomCategory = (category: CategoryOption) =>
  mushroomSlugs.includes(category.slug) || /mushroom|tincture/i.test(category.title);
/** "Fresh mushrooms" reads as "Fresh", "Mushroom powders" as "Powders", under the "Mushrooms" label. */
export const shortTitle = (category: CategoryOption) =>
  isMushroomCategory(category) ? sentenceCase(category.title.replace(/^mushroom\s+|\s+mushrooms?$/gi, "")) : category.title;
const mushroomNames: Record<string, string> = {
  edible: "Edible mushrooms",
  medicinal: "Medicinal mushrooms",
  powders: "Mushroom powders",
};

export function categoryOptions(products: Product[]): CategoryOption[] {
  const map = new Map<string, { title: string; products: Product[] }>();
  for (const product of products) {
    for (const { category } of product.categories ?? []) {
      const entry = map.get(category.slug) ?? { title: category.title, products: [] };
      entry.products.push(product);
      map.set(category.slug, entry);
    }
  }
  const rank = (slug: string) => { const i = categoryOrder.indexOf(slug); return i < 0 ? categoryOrder.length : i; };
  return Array.from(map.entries())
    .map(([slug, { title, products: items }]) => {
      const freshOnly = items.every(isFreshMushroom);
      return { slug, title: slug === "edible" && freshOnly ? "Fresh mushrooms" : mushroomNames[slug] ?? sentenceCase(title), count: items.length, freshOnly };
    })
    .sort((a, b) => rank(a.slug) - rank(b.slug) || a.title.localeCompare(b.title));
}

const unitPrice = (product: Product) => product.discountedPrice ?? product.price;

/** The existing default order: in-stock first, with categories interleaved so the first page shows the whole pantry. */
function recommended(products: Product[]) {
  const spread = (items: Product[]) => {
    const groups = new Map<string, Product[]>();
    for (const item of items) {
      const key = item.categories?.[0]?.category.slug ?? "other";
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    const queues = Array.from(groups.values());
    const result: Product[] = [];
    while (queues.some(queue => queue.length)) for (const queue of queues) { const next = queue.shift(); if (next) result.push(next); }
    return result;
  };
  return [...spread(products.filter(p => p.inStock)), ...spread(products.filter(p => !p.inStock))];
}

export function sortProducts(products: Product[], sort: Sort) {
  if (sort === "recommended") return recommended(products);
  const sorted = [...products].sort((a, b) =>
    sort === "price-low" ? unitPrice(a) - unitPrice(b) :
    sort === "price-high" ? unitPrice(b) - unitPrice(a) :
    a.title.localeCompare(b.title));
  return [...sorted.filter(p => p.inStock), ...sorted.filter(p => !p.inStock)];
}

/** Spawn and grow bags are for growing mushrooms, not food: they have their own band on the homepage. */
export function splitCatalogue(catalogue: Product[]) {
  return { products: catalogue.filter(p => !isGrowProduct(p)), growing: catalogue.filter(isGrowProduct) };
}

/** What the URL asks for: categories (without the grow link), sort and page number. */
export function readShopQuery(params: Pick<URLSearchParams, "get">) {
  const requestedAll = (params.get("category") ?? "").split(",").map(slug => slug.trim()).filter(Boolean);
  const sortParam = params.get("sort");
  return {
    requested: requestedAll.filter(slug => slug !== GROW_CATEGORY),
    wantsGrow: requestedAll.includes(GROW_CATEGORY),
    sort: (sorts.some(option => option.value === sortParam) ? sortParam : "recommended") as Sort,
    requestedPage: parseInt(params.get("page") ?? "1", 10) || 1,
  };
}

/** Filter and sort the pantry products, then clamp the page to the ones that exist. */
export function shopPage(products: Product[], selected: string[], sort: Sort, requestedPage: number) {
  const filtered = sortProducts(
    selected.length ? products.filter(p => p.categories?.some(({ category }) => selected.includes(category.slug))) : products, sort);
  const pages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const page = Math.min(Math.max(requestedPage, 1), pages);
  const firstIndex = (page - 1) * PRODUCTS_PER_PAGE;
  return { filtered, pages, page, firstIndex, visible: filtered.slice(firstIndex, page * PRODUCTS_PER_PAGE) };
}

/** The products one URL shows, for a server that already has the whole catalogue. */
export function shopView(catalogue: Product[], params: Pick<URLSearchParams, "get">) {
  const { products } = splitCatalogue(catalogue);
  const categories = categoryOptions(products);
  const { requested, sort, requestedPage } = readShopQuery(params);
  const selected = requested.filter(slug => categories.some(category => category.slug === slug));
  return shopPage(products, selected, sort, requestedPage);
}
