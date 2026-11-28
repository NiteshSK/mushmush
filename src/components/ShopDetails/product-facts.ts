import type { Product } from "@/types/product";
import { sellablePackLimit } from "@/lib/inventory";
import { GROW_CATEGORY, isFreshMushroom, isGrowProduct, productCover, sentenceCase } from "../Pantry/catalogue";

/**
 * Facts about one product that both the page (server) and the product view (browser) use:
 * its shelf for the breadcrumb, its photos and whether it is sold out. No "use client" here,
 * so the server page can call these functions.
 */

const shelfOrder = ["spices", "dry-fruits", "seeds", "edible", "medicinal", "powders", "tinctures"];
// Shopper-facing names for the short mushroom category titles stored in the database ("Edible", "Medicinal", "Dry Powder").
const shelfNames: Record<string, string> = { edible: "Edible mushrooms", medicinal: "Medicinal mushrooms", powders: "Mushroom powders" };

export type Shelf = { slug: string; title: string; href: string; grow: boolean };

/**
 * The shelf a product belongs to, for the breadcrumb and related packs. Fresh mushrooms belong to the edible shelf.
 * Spawn and grow bags belong to "Grow your own", even where the catalogue still files them under Seeds:
 * the slug stays the stored category (for the related fetch), but the name and link are the grow band.
 */
export function shelf(product: Product): Shelf | undefined {
  const categories = (product.categories ?? []).map(({ category }) => category);
  const rank = (slug: string) => { const i = shelfOrder.indexOf(slug); return i < 0 ? shelfOrder.length : i; };
  const grow = isGrowProduct(product);
  const primary = (grow && categories.find(category => category.slug === GROW_CATEGORY))
    || (isFreshMushroom(product) && categories.find(category => category.slug === "edible"))
    || categories.slice().sort((a, b) => rank(a.slug) - rank(b.slug))[0];
  if (!primary) return undefined;
  if (grow) return { slug: primary.slug, title: "Grow your own", href: "/#grow", grow };
  return { slug: primary.slug, title: shelfNames[primary.slug] ?? sentenceCase(primary.title), href: `/shop?category=${encodeURIComponent(primary.slug)}`, grow };
}

/** Gallery photos: previews, then thumbnails, without repeats. */
export const photos = (product: Pick<Product, "imgs">) =>
  Array.from(new Set([...(product.imgs?.previews ?? []), ...(product.imgs?.thumbnails ?? [])].filter(Boolean)));

/** Every photo of the product with the card photo first, for search engines and link previews. */
export const allPhotos = (product: Pick<Product, "imgs">) =>
  Array.from(new Set([productCover(product), ...photos(product)].filter((src): src is string => Boolean(src))));

/** Sold out when the product is switched off or no full pack is left. */
export const isSoldOut = (product: Pick<Product, "inStock" | "stockQuantity">) =>
  sellablePackLimit(product) === 0;
