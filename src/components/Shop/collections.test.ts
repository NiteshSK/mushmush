import { COLLECTIONS, collectionForCategoryQuery, collectionPath, collectionProducts, findCollection } from "./collections";
import { shopItemList } from "./structured-data";

type Item = { title: string; fulfillmentClass?: string | null; categories: { category: { slug: string; title: string } }[] };
const make = (title: string, slugs: string[], fulfillmentClass?: string): Item =>
  ({ title, fulfillmentClass, categories: slugs.map(slug => ({ category: { slug, title: slug } })) });

// The shape of the live catalogue (November 2026).
const catalogue = [
  make("Himalayan Turmeric", ["spices"], "national"),
  make("Mustard Seeds", ["seeds", "spices"], "national"),
  make("Chia Seeds", ["seeds"], "national"),
  make("Premium Walnuts", ["dry-fruits"], "national"),
  make("Dried Apricots", ["dry-fruits"], "national"),
  make("Dried Turkey Tail Mushroom", ["medicinal", "powders"], "national"),
  make("Ganoderma lucidum", ["medicinal", "powders"], "national"),
  make("Ganoderma's Tincture", ["tinctures", "medicinal"], "national"),
  make("King Oyster (Eryngii)", ["edible"], "fresh"),
  make("Lion's Mane", ["medicinal", "edible"], "fresh"),
  // Older products without a delivery class fall back to the category and name.
  make("Oyster Mushroom", ["edible"]),
  make("Dried Shiitake", ["edible"]),
  make("Ready-to-Fruit Oyster Mushroom Grow Bag", ["grow-your-own"], "national"),
  make("Oyster Mushroom Spawn", ["edible"], "national"),
];
const titles = (slug: string) => collectionProducts(findCollection(slug)!, catalogue).map(p => p.title);

describe("shop collections", () => {
  it("has the six friendly slugs, each at /shop/<slug>", () => {
    expect(COLLECTIONS.map(c => c.slug)).toEqual(["dried-mushrooms", "fresh-mushrooms", "spices", "dry-fruits", "seeds", "medicinal-mushrooms"]);
    expect(collectionPath(COLLECTIONS[0])).toBe("/shop/dried-mushrooms");
    expect(findCollection("not-a-collection")).toBeUndefined();
  });

  it("gives every collection its own title, description, heading and intro", () => {
    for (const c of COLLECTIONS) {
      expect(c.title).toMatch(/ \| Kosvana$/);
      expect(c.description.length).toBeGreaterThan(50);
      expect(c.heading.join("")).toMatch(/\.$/);
      expect(c.intro.length).toBeGreaterThan(50);
    }
    expect(new Set(COLLECTIONS.map(c => c.title)).size).toBe(COLLECTIONS.length);
    expect(findCollection("dried-mushrooms")!.title).toBe("Dried mushrooms online in India | Kosvana");
    expect(findCollection("fresh-mushrooms")!.title).toBe("Fresh mushrooms in Dehradun | Kosvana");
  });

  it("lists pantry products by their database category", () => {
    expect(titles("spices")).toEqual(["Himalayan Turmeric", "Mustard Seeds"]);
    expect(titles("seeds")).toEqual(["Mustard Seeds", "Chia Seeds"]);
    expect(titles("dry-fruits")).toEqual(["Premium Walnuts", "Dried Apricots"]);
  });

  it("puts dried and powdered mushrooms in dried mushrooms, but not fresh mushrooms or tinctures", () => {
    expect(titles("dried-mushrooms")).toEqual(["Dried Turkey Tail Mushroom", "Ganoderma lucidum", "Dried Shiitake"]);
  });

  it("puts only fresh mushrooms in fresh mushrooms, including older products without a delivery class", () => {
    expect(titles("fresh-mushrooms")).toEqual(["King Oyster (Eryngii)", "Lion's Mane", "Oyster Mushroom"]);
  });

  it("lists medicinal mushrooms in every form", () => {
    expect(titles("medicinal-mushrooms")).toEqual(["Dried Turkey Tail Mushroom", "Ganoderma lucidum", "Ganoderma's Tincture", "Lion's Mane"]);
  });

  it("never lists spawn or grow bags in a pantry collection", () => {
    for (const c of COLLECTIONS) {
      expect(collectionProducts(c, catalogue).map(p => p.title).join()).not.toMatch(/spawn|grow bag/i);
    }
  });

  it("finds the collection that a single-category shop filter shows exactly", () => {
    expect(collectionForCategoryQuery("spices")?.slug).toBe("spices");
    expect(collectionForCategoryQuery(" dry-fruits ")?.slug).toBe("dry-fruits");
    expect(collectionForCategoryQuery("spices,seeds")).toBeUndefined();
    expect(collectionForCategoryQuery("edible")).toBeUndefined();
    expect(collectionForCategoryQuery(undefined)).toBeUndefined();
  });

  it("names the ItemList after the collection and points it at the collection URL", () => {
    const list = shopItemList([{ slug: "cumin-seeds", title: "Cumin Seeds" }], 1, { name: "Spices from Kosvana", path: "/shop/spices" });
    expect(list).toMatchObject({ name: "Spices from Kosvana", url: "https://www.kosvana.com/shop/spices", numberOfItems: 1 });
  });
});
