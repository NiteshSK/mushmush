import { deliveryScope, isFreshMushroom, packLabel, productKind, searchCatalogue } from "./catalogue";

const product = (title: string, categories: string[], description = "", extra: Partial<{ measurementValue: number; measurementType: string }> = {}) => ({
  title, description, measurementValue: 200, measurementType: "gm", ...extra,
  categories: categories.map(slug => ({ category: { slug, title: slug === "dry-fruits" ? "Dry Fruits" : slug.charAt(0).toUpperCase() + slug.slice(1) } })),
});

const cumin = product("Cumin Seeds", ["spices"], "Whole jeera seeds.");
const turmeric = product("Himalayan Turmeric", ["spices"], "<strong>Pahadi haldi</strong>. Pairs well with cumin.");
const walnuts = product("Premium Walnuts", ["dry-fruits"], "Akhrot kernels.");
const kingOyster = product("King Oyster (Eryngii)", ["edible"]);
const shiitake = product("Shitake", ["medicinal", "edible"]);
const turkeyTail = product("Dried Turkey Tail Mushroom", ["powders", "medicinal"]);
const tincture = product("Ganoderma's Tincture", ["medicinal", "tinctures"], "", { measurementValue: 10, measurementType: "ml" });
const growBag = product("Ready to fruit Oyster mushroom grow bag", ["seeds"]);
const catalogue = [turmeric, walnuts, cumin, kingOyster, shiitake, turkeyTail, tincture, growBag];

describe("searchCatalogue", () => {
  it("ranks a name match above a description match", () => {
    expect(searchCatalogue(catalogue, "cumin").map(p => p.title)).toEqual(["Cumin Seeds", "Himalayan Turmeric"]);
  });

  it("matches local names and the catalogue's alternative spellings", () => {
    expect(searchCatalogue(catalogue, "jeera")[0]).toBe(cumin);
    expect(searchCatalogue(catalogue, "akhrot")[0]).toBe(walnuts);
    expect(searchCatalogue(catalogue, "shiitake")).toEqual([shiitake]);
  });

  it("requires every word and ignores case, punctuation and plural endings", () => {
    expect(searchCatalogue(catalogue, "  DRIED   mushroom ")).toEqual([turkeyTail]);
    expect(searchCatalogue(catalogue, "walnut")).toEqual([walnuts]);
    expect(searchCatalogue(catalogue, "saffron")).toEqual([]);
    expect(searchCatalogue(catalogue, "   ")).toEqual([]);
  });
});

describe("delivery scope", () => {
  it("treats edible mushrooms as fresh and Dehradun-only", () => {
    expect(isFreshMushroom(kingOyster)).toBe(true);
    expect(deliveryScope(shiitake)).toBe("fresh");
  });

  it("ships dried, powdered and tincture products and every other pantry item across India", () => {
    for (const item of [turkeyTail, tincture, cumin, walnuts, growBag]) expect(deliveryScope(item)).toBe("national");
  });
});

describe("card labels", () => {
  it("names the product kind and pack size in shopper terms", () => {
    expect(productKind(kingOyster)).toBe("Fresh mushrooms");
    expect(productKind(turkeyTail)).toBe("Dried mushrooms");
    expect(productKind(growBag)).toBe("Grow your own");
    expect(productKind(walnuts)).toBe("Dry fruits");
    expect(productKind(tincture)).toBe("Tinctures");
    expect(packLabel(cumin)).toBe("200 g");
    expect(packLabel(tincture)).toBe("10 ml");
  });
});
