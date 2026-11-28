import ShopOffers from "@/components/Pantry/ShopOffers";
import type { Metadata } from "next";
import Shop from "@/components/Shop";
import PantryShell from "@/components/Pantry/PantryShell";
import JsonLd from "@/components/Seo/JsonLd";
import { shopView } from "@/components/Shop/listing";
import { shopItemList } from "@/components/Shop/structured-data";
import { listCatalogueProducts } from "@/lib/catalogue-server";
import { breadcrumbJsonLd, shareMetadata } from "@/lib/seo";
import type { Product } from "@/types/product";

const title = "Shop the pantry | Kosvana";
const description = "Shop Kosvana’s Himalayan pantry: dried mushrooms, spices, dry fruits and seeds delivered across India, with fresh mushrooms in Dehradun.";

// Filtered, sorted and later pages are views of one listing: they all canonicalise to /shop.
export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/shop", title, description }) };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toQuery(params: Awaited<SearchParams>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) query.set(key, first);
  }
  return query;
}

/**
 * The catalogue in the /api/products JSON shape (the same as the browser fetch), or undefined when
 * the database fails. Product-page text that the listing does not show stays out of the HTML.
 */
async function loadCatalogue(): Promise<Product[] | undefined> {
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

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  // Reading the query makes the page render per request, so the first HTML lists the products for this URL.
  const query = toQuery(await searchParams);
  const catalogue = await loadCatalogue();
  const view = catalogue ? shopView(catalogue, query) : null;

  return (
    <PantryShell current="shop" skipTo={{ href: "#products", label: "Skip to products" }}>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }])} />
      {view && view.visible.length > 0 && <JsonLd data={shopItemList(view.visible, view.firstIndex + 1)} />}
      {/* Without server data the shop loads the products in the browser, as before. */}
      <Shop initialProducts={catalogue} />
      <ShopOffers/>
    </PantryShell>
  );
}
