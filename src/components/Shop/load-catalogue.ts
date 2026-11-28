import { listCatalogueProducts } from "@/lib/catalogue-server";
import type { Product } from "@/types/product";

/**
 * The catalogue in the /api/products JSON shape (the same as the browser fetch), or undefined when
 * the database fails. Product-page text that the listing does not show stays out of the HTML.
 * Server only: the shop and collection pages call it.
 */
export async function loadListedCatalogue(): Promise<Product[] | undefined> {
  try {
    // The same 100 products the shop asked /api/products for in the browser.
    const { products } = await listCatalogueProducts({ take: 100 });
    const listed = products.map(({ description: _d, specifications: _s, howToConsume: _h, additionalInfo: _a, benefits: _b, reviews: _r, discounts: _x, ...product }) =>
      ({ ...product, description: "", specifications: [], howToConsume: [], additionalInfo: [] }));
    return JSON.parse(JSON.stringify(listed)) as Product[];
  } catch (error) {
    console.error("Error loading the shop catalogue:", error);
    return undefined;
  }
}
