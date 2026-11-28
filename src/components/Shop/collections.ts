/**
 * Shop collections: the indexable landing pages at /shop/<slug>, such as /shop/dried-mushrooms.
 * Pure rules (no React, no database), so the server page, the client page, the sitemap and the
 * footer all agree on which collections exist and which products each one lists.
 */
import { isFreshMushroom, isGrowProduct, productKind } from "../Pantry/catalogue";

/** What the rules read: the name, the delivery class (from the API; not on the Product type) and the categories. */
type CollectionProduct = {
  title: string;
  fulfillmentClass?: string | null;
  categories?: { category: { slug: string; title?: string } }[];
};

export type Collection = {
  slug: string;
  /** Link text and breadcrumb name, e.g. "Dried mushrooms". */
  name: string;
  /** The h1 as two parts: plain text, then the word in <em>. */
  heading: [string, string];
  kicker: string;
  intro: string;
  title: string;
  description: string;
  /** The one database category this collection shows in full, when there is one: /shop?category=<slug> canonicalises here. */
  category?: string;
  matches: (product: CollectionProduct) => boolean;
};

const slugsOf = (product: CollectionProduct) => product.categories?.map(({ category }) => category.slug) ?? [];
const inCategory = (...slugs: string[]) => (product: CollectionProduct) => slugsOf(product).some(slug => slugs.includes(slug));
const isMushroom = (product: CollectionProduct) =>
  inCategory("edible", "medicinal", "powders", "tinctures")(product) || /mushroom/i.test(product.title);
const asCatalogue = (product: CollectionProduct) =>
  ({ measurementValue: 0, measurementType: "gm", ...product }) as Parameters<typeof productKind>[0];

const NATIONAL = "Packed by Kosvana in Herbertpur, Dehradun, and sent across India.";

export const COLLECTIONS: Collection[] = [
  {
    slug: "dried-mushrooms",
    name: "Dried mushrooms",
    heading: ["Dried ", "mushrooms."],
    kicker: "Sent across India",
    intro: `Dried and powdered mushrooms from the Kosvana pantry. ${NATIONAL} Fresh mushrooms are listed separately and go to Dehradun only.`,
    title: "Dried mushrooms online in India | Kosvana",
    description: "Buy dried mushrooms and mushroom powders online from Kosvana, packed in Herbertpur, Dehradun, and delivered across India.",
    // Dried and powdered mushrooms ship anywhere; fresh mushrooms and liquid tinctures are not dried.
    matches: product => productKind(asCatalogue(product)) === "Dried mushrooms" ||
      (isMushroom(product) && !isFreshMushroom(asCatalogue(product)) && !inCategory("tinctures")(product)),
  },
  {
    slug: "fresh-mushrooms",
    name: "Fresh mushrooms",
    heading: ["Fresh ", "mushrooms."],
    kicker: "Dehradun only",
    intro: "Fresh mushrooms grown by Kosvana in Herbertpur. We deliver them to kitchens in Dehradun only. For the rest of India, see our dried mushrooms.",
    title: "Fresh mushrooms in Dehradun | Kosvana",
    description: "Order fresh mushrooms grown in Herbertpur, Dehradun, from Kosvana: oyster, king oyster, shiitake, lion’s mane and more, delivered in Dehradun.",
    matches: product => isFreshMushroom(asCatalogue(product)),
  },
  {
    slug: "spices",
    name: "Spices",
    heading: ["Himalayan ", "spices."],
    kicker: "Sent across India",
    intro: `Spices from the Kosvana pantry, such as turmeric, garlic, cumin and black pepper. ${NATIONAL}`,
    title: "Himalayan spices online | Kosvana",
    description: "Buy spices online from Kosvana: turmeric, garlic, cumin, cloves, black pepper and more, packed in Herbertpur, Dehradun, and delivered across India.",
    category: "spices",
    matches: inCategory("spices"),
  },
  {
    slug: "dry-fruits",
    name: "Dry fruits",
    heading: ["Dry ", "fruits."],
    kicker: "Sent across India",
    intro: `Dry fruits from the Kosvana pantry, such as walnuts, almonds, cashews, raisins and apricots. ${NATIONAL}`,
    title: "Dry fruits online in India | Kosvana",
    description: "Buy dry fruits online from Kosvana: walnuts, almonds, cashews, golden raisins and dried apricots, packed in Herbertpur, Dehradun, and delivered across India.",
    category: "dry-fruits",
    matches: inCategory("dry-fruits"),
  },
  {
    slug: "seeds",
    name: "Seeds",
    heading: ["Edible ", "seeds."],
    kicker: "Sent across India",
    intro: `Seeds for the kitchen from the Kosvana pantry, such as chia, pumpkin, sunflower, sesame and mustard. ${NATIONAL}`,
    title: "Edible seeds online in India | Kosvana",
    description: "Buy edible seeds online from Kosvana: chia, pumpkin, sunflower, sesame and mustard seeds, packed in Herbertpur, Dehradun, and delivered across India.",
    category: "seeds",
    matches: inCategory("seeds"),
  },
  {
    slug: "medicinal-mushrooms",
    name: "Medicinal mushrooms",
    heading: ["Medicinal ", "mushrooms."],
    kicker: "Herbertpur, Dehradun",
    intro: "Medicinal mushrooms from Kosvana, such as ganoderma, turkey tail and lion’s mane, dried, powdered, as tinctures or fresh. Dried mushrooms and tinctures go across India. Fresh mushrooms go to Dehradun only.",
    title: "Medicinal mushrooms online in India | Kosvana",
    description: "Shop medicinal mushrooms from Kosvana: ganoderma (reishi), turkey tail and lion’s mane, as dried mushrooms, powders, tinctures and fresh mushrooms.",
    matches: inCategory("medicinal", "tinctures"),
  },
];

export const collectionPath = (collection: Pick<Collection, "slug">) => `/shop/${collection.slug}`;

export function findCollection(slug: string) {
  return COLLECTIONS.find(collection => collection.slug === slug);
}

/** The products a collection lists. Spawn and grow bags are never in a pantry collection. */
export function collectionProducts<T extends CollectionProduct>(collection: Collection, products: T[]): T[] {
  return products.filter(product => !isGrowProduct(product) && collection.matches(product));
}

/** The collection /shop?category=<value> shows exactly, when the value is one category that has a collection. */
export function collectionForCategoryQuery(category: string | undefined) {
  const slugs = (category ?? "").split(",").map(slug => slug.trim()).filter(Boolean);
  return slugs.length === 1 ? COLLECTIONS.find(collection => collection.category === slugs[0]) : undefined;
}
