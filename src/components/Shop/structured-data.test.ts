import type { Product } from "@/types/product";
import { PRODUCTS_PER_PAGE, shopView } from "./listing";
import { shopItemList } from "./structured-data";

let nextId = 1;
const make = (slug: string, title: string, category: string, extra: Partial<Product> = {}) => ({
  id: nextId++, slug, title, description: "", price: 149, measurementValue: 200, measurementType: "gm", inStock: true, featured: false,
  imgs: { previews: [], thumbnails: [] }, specifications: [], howToConsume: [], additionalInfo: [],
  categories: [{ category: { id: 1, slug: category, title: category } }], ...extra,
}) as Product;

describe("shop ItemList", () => {
  it("lists each product with its position, absolute product URL and name", () => {
    expect(shopItemList([{ slug: "cumin-seeds", title: "Cumin Seeds" }, { slug: "lion-s-mane", title: "Lion's Mane" }])).toEqual({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "The Kosvana pantry",
      url: "https://www.kosvana.com/shop",
      numberOfItems: 2,
      itemListElement: [
        { "@type": "ListItem", position: 1, url: "https://www.kosvana.com/shop-details/cumin-seeds", name: "Cumin Seeds" },
        { "@type": "ListItem", position: 2, url: "https://www.kosvana.com/shop-details/lion-s-mane", name: "Lion's Mane" },
      ],
    });
  });

  it("continues the numbering on later pages", () => {
    const list = shopItemList([{ slug: "a", title: "A" }], 13);
    expect(list.itemListElement[0].position).toBe(13);
  });
});

describe("shopView (the products the server lists for a URL)", () => {
  const catalogue = [
    make("cumin-seeds", "Cumin Seeds", "spices"),
    make("black-pepper", "Black Pepper", "spices", { price: 199 }),
    make("chia-seeds", "Chia Seeds", "seeds"),
    make("oyster-spawn", "Oyster Spawn", "seeds"),
    make("grow-bag", "Oyster Grow Bag", "grow-your-own"),
  ];

  it("leaves out spawn and grow products", () => {
    expect(shopView(catalogue, new URLSearchParams("")).visible.map(p => p.slug)).toEqual(["cumin-seeds", "chia-seeds", "black-pepper"]);
  });

  it("applies the category and sort from the URL and ignores unknown categories", () => {
    const view = shopView(catalogue, new URLSearchParams("category=spices,not-real&sort=price-high"));
    expect(view.visible.map(p => p.slug)).toEqual(["black-pepper", "cumin-seeds"]);
  });

  it("clamps the page and gives the first index of the visible products", () => {
    const many = Array.from({ length: PRODUCTS_PER_PAGE + 2 }, (_, i) => make(`spice-${i}`, `Spice ${String(i).padStart(2, "0")}`, "spices"));
    const view = shopView(many, new URLSearchParams("sort=name&page=9"));
    expect(view.page).toBe(2);
    expect(view.firstIndex).toBe(PRODUCTS_PER_PAGE);
    expect(view.visible.map(p => p.title)).toEqual(["Spice 12", "Spice 13"]);
  });
});
