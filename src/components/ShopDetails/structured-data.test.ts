import { breadcrumbJsonLd, productJsonLd } from "./structured-data";

const cumin = {
  id: 50, slug: "cumin-seeds", title: "Cumin Seeds", description: "<p><strong>Cumin Seeds</strong> (Jeera) are an&nbsp;essential spice &amp; a staple.</p>",
  price: 149, discountedPrice: null, hasDiscount: false, discountPercentage: 0, measurementValue: 200, measurementType: "gm",
  stockQuantity: 50, inStock: true, featured: false, reviewCount: 0, averageRating: 0, fulfillmentClass: "national",
  imgs: { previews: ["/images/products/cumin_seeds.png", "/images/products/cumin_2.png"], thumbnails: ["/images/products/cumin_seeds.png"] },
  specifications: [], howToConsume: [], additionalInfo: [],
  categories: [{ category: { id: 28, slug: "spices", title: "Spices" } }],
};

describe("productJsonLd", () => {
  it("describes the product and its offer with absolute URLs and plain text", () => {
    expect(productJsonLd(cumin)).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Cumin Seeds",
      description: "Cumin Seeds (Jeera) are an essential spice & a staple.",
      image: ["https://www.kosvana.com/images/products/cumin_seeds.png", "https://www.kosvana.com/images/products/cumin_2.png"],
      sku: "cumin-seeds",
      url: "https://www.kosvana.com/shop-details/cumin-seeds",
      brand: { "@type": "Brand", name: "Kosvana" },
      offers: {
        "@type": "Offer",
        url: "https://www.kosvana.com/shop-details/cumin-seeds",
        priceCurrency: "INR",
        price: "149",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "Kosvana", url: "https://www.kosvana.com/" },
      },
    });
  });

  it("uses the discounted price the shopper pays", () => {
    expect(productJsonLd({ ...cumin, price: 449, discountedPrice: 399, hasDiscount: true }).offers.price).toBe("399");
    expect(productJsonLd({ ...cumin, price: 149.5 }).offers.price).toBe("149.50");
  });

  it("marks a product out of stock when it is switched off or no pack is left", () => {
    expect(productJsonLd({ ...cumin, inStock: false }).offers.availability).toBe("https://schema.org/OutOfStock");
    expect(productJsonLd({ ...cumin, stockQuantity: 0 }).offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("puts the card photo first and keeps absolute photo URLs", () => {
    const product = { ...cumin, imgs: { cover: "https://cdn.example.com/cover.jpg", previews: ["/a.png"], thumbnails: ["/a.png"] } };
    expect(productJsonLd(product).image).toEqual(["https://cdn.example.com/cover.jpg", "https://www.kosvana.com/a.png"]);
  });

  it("limits fresh mushrooms to Dehradun", () => {
    const fresh = { ...cumin, fulfillmentClass: "fresh", categories: [{ category: { id: 3, slug: "edible", title: "Edible" } }] };
    expect(productJsonLd(fresh).offers).toMatchObject({ areaServed: { "@type": "City", name: "Dehradun" } });
    expect(productJsonLd(cumin).offers).not.toHaveProperty("areaServed");
  });

  it("never adds ratings, and leaves out an empty description", () => {
    const data = productJsonLd({ ...cumin, description: "", reviewCount: 6, averageRating: 4.3 });
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("review");
    expect(data).not.toHaveProperty("description");
  });

  it("survives JSON round trips as valid JSON", () => {
    expect(JSON.parse(JSON.stringify(productJsonLd(cumin)))).toEqual(productJsonLd(cumin));
  });
});

describe("breadcrumbJsonLd", () => {
  const items = (product: typeof cumin) => breadcrumbJsonLd(product).itemListElement.map(({ position, name, item }) => [position, name, item]);

  it("follows Home, Shop, shelf, product", () => {
    expect(breadcrumbJsonLd(cumin)["@type"]).toBe("BreadcrumbList");
    expect(items(cumin)).toEqual([
      [1, "Home", "https://www.kosvana.com/"],
      [2, "Shop", "https://www.kosvana.com/shop"],
      [3, "Spices", "https://www.kosvana.com/shop?category=spices"],
      [4, "Cumin Seeds", "https://www.kosvana.com/shop-details/cumin-seeds"],
    ]);
  });

  it("skips the shelf when the product has no category", () => {
    expect(items({ ...cumin, categories: [] }).map(([, name]) => name)).toEqual(["Home", "Shop", "Cumin Seeds"]);
  });
});
