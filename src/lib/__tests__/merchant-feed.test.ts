import { feedItem, merchantFeed, type FeedProduct } from "@/lib/merchant-feed";

const product = (over: Partial<FeedProduct> = {}): FeedProduct => ({
  slug: "cumin-seeds", title: "Cumin Seeds", description: "<p>Whole <b>jeera</b> &amp; more.</p>", price: 149, discountedPrice: null,
  inStock: true, measurementValue: 200, measurementType: "gm", fulfillmentClass: "national",
  imgs: { previews: ["/images/products/cumin.png", "https://cdn.example/cumin-2.png"] },
  categories: [{ category: { slug: "spices", title: "Spices" } }], ...over,
});

describe("Merchant Center feed", () => {
  it("describes a product with absolute links, INR price, stock and brand", () => {
    const item = feedItem(product());
    expect(item).toContain("<g:id>cumin-seeds</g:id>");
    expect(item).toContain("<g:title>Cumin Seeds 200 g</g:title>");
    expect(item).toContain("<g:link>https://www.kosvana.com/shop-details/cumin-seeds</g:link>");
    expect(item).toContain("<g:image_link>https://www.kosvana.com/images/products/cumin.png</g:image_link>");
    expect(item).toContain("<g:additional_image_link>https://cdn.example/cumin-2.png</g:additional_image_link>");
    expect(item).toContain("<g:price>149.00 INR</g:price>");
    expect(item).toContain("<g:availability>in_stock</g:availability>");
    expect(item).toContain("<g:brand>Kosvana</g:brand>");
    expect(item).not.toContain("<g:sale_price>");
  });

  it("sends plain, escaped text and a sale price only for a real discount", () => {
    const item = feedItem(product({ discountedPrice: 129 }));
    expect(item).toContain("<g:description>Whole jeera &amp; more.</g:description>");
    expect(item).toContain("<g:sale_price>129.00 INR</g:sale_price>");
  });

  it("marks sold-out products out of stock", () => {
    expect(feedItem(product({ inStock: false }))).toContain("<g:availability>out_of_stock</g:availability>");
  });

  it("leaves out fresh mushrooms (Dehradun only) and products without a photo", () => {
    const feed = merchantFeed([
      product(),
      product({ slug: "oyster-mushroom", title: "Oyster Mushroom", fulfillmentClass: "fresh" }),
      product({ slug: "no-photo", imgs: {} }),
    ]);
    expect(feed).toContain("<g:id>cumin-seeds</g:id>");
    expect(feed).not.toContain("oyster-mushroom");
    expect(feed).not.toContain("no-photo");
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it("gives growing supplies no food category", () => {
    const item = feedItem(product({ slug: "oyster-spawn", title: "Oyster Mushroom Spawn", categories: [{ category: { slug: "grow-your-own" } }] }));
    expect(item).not.toContain("google_product_category");
  });
});
