import type { Product } from "@/types/product";

type CatalogueProduct = Pick<Product, "title" | "measurementValue" | "measurementType"> & {
  fulfillmentClass?: string | null;
  description?: string;
  categories?: { category: { slug: string; title?: string } }[];
};

export const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });

export function packLabel(product: Pick<Product, "measurementValue" | "measurementType">) {
  if (product.measurementType === "gm" && product.measurementValue >= 1000) return `${Number((product.measurementValue / 1000).toFixed(2))} kg`;
  const unit = product.measurementType === "gm" ? "g" : product.measurementType;
  return `${product.measurementValue} ${unit}`;
}

export function productCover({ imgs }: {
  imgs?: { cover?: string; previews?: string[]; thumbnails?: string[] };
}) {
  // The first photo in admin is the card photo. No per-product overrides: photo order differs between databases.
  return imgs?.cover || imgs?.previews?.[0] || imgs?.thumbnails?.[0];
}

export function sentenceCase(text: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : text;
}

const categorySlugs = (product: CatalogueProduct) => product.categories?.map(({ category }) => category.slug) ?? [];

/** Older products without an explicit delivery class use their category and title. */
export function isFreshMushroom(product: CatalogueProduct) {
  if (product.fulfillmentClass) return product.fulfillmentClass === "fresh";
  const slugs = categorySlugs(product);
  if (!slugs.includes("edible")) return false;
  if (slugs.includes("powders") || slugs.includes("tinctures")) return false;
  return !/\b(dried|dry|powder|tincture|extract)\b/i.test(product.title);
}

/** Category for mushroom spawn and grow bags: supplies for growing mushrooms, not food. */
export const GROW_CATEGORY = "grow-your-own";

/** Spawn and grow bags. Matches the grow category, or the product name for catalogues not yet moved to it. */
export function isGrowProduct(product: Pick<CatalogueProduct, "title" | "categories">) {
  return categorySlugs(product as CatalogueProduct).includes(GROW_CATEGORY) || /\bspawn\b|grow.?bag/i.test(product.title);
}

export type DeliveryScope = "fresh" | "national";
export const deliveryScope = (product: CatalogueProduct): DeliveryScope => isFreshMushroom(product) ? "fresh" : "national";

const kindPriority = ["tinctures", "powders", "medicinal", "spices", "dry-fruits", "seeds", "edible"];

/** Short shopper-facing kind shown above the product name, e.g. "Spices" or "Fresh mushrooms". */
export function productKind(product: CatalogueProduct) {
  if (isFreshMushroom(product)) return "Fresh mushrooms";
  if (/\bdried\b/i.test(product.title) && /mushroom/i.test(product.title)) return "Dried mushrooms";
  if (isGrowProduct(product)) return "Grow your own";
  const categories = product.categories ?? [];
  const primary = kindPriority.map(slug => categories.find(({ category }) => category.slug === slug)).find(Boolean) ?? categories[0];
  return primary?.category.title ? sentenceCase(primary.category.title) : undefined;
}

// Local and alternative names for items in the current catalogue.
const synonyms: Record<string, string[]> = {
  haldi: ["turmeric"], jeera: ["cumin"], akhrot: ["walnut"], badam: ["almond"], kaju: ["cashew"],
  kishmish: ["raisin"], til: ["sesame"], sarson: ["mustard"], rai: ["mustard"], laung: ["clove"],
  lehsun: ["garlic"], mirch: ["pepper"], khumbi: ["mushroom"], dhingri: ["oyster"], reishi: ["ganoderma"],
  shiitake: ["shitake"], shitake: ["shiitake"], chanterelle: ["chantrelle"], chantrelle: ["chanterelle"],
};

const normalise = (text: string) => text.toLowerCase().replace(/<[^>]*>/g, " ").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Ranks catalogue products for a free-text query. Every word must match somewhere.
 * Name matches rank above category matches, which rank above description matches.
 */
export function searchCatalogue<T extends CatalogueProduct>(products: T[], query: string): T[] {
  const terms = normalise(query).split(" ").filter(Boolean);
  if (!terms.length) return [];
  const scored: { product: T; score: number }[] = [];
  for (const product of products) {
    const title = normalise(product.title);
    const words = title.split(" ");
    const categories = normalise((product.categories ?? []).map(({ category }) => `${category.title ?? ""} ${category.slug}`).join(" "));
    const description = normalise(product.description ?? "");
    let score = 0;
    for (const term of terms) {
      const variants = [term, ...(synonyms[term] ?? [])];
      const best = Math.max(...variants.map(v =>
        words.some(word => word.startsWith(v)) ? 3 : title.includes(v) ? 2 : categories.includes(v) ? 1.5 : description.includes(v) ? 1 : 0));
      if (!best) { score = 0; break; }
      score += best;
    }
    if (score) scored.push({ product, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title)).map(({ product }) => product);
}
