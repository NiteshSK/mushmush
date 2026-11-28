import ShopOffers from "@/components/Pantry/ShopOffers";
import type { Metadata } from "next";
import Shop from "@/components/Shop";
import PantryShell from "@/components/Pantry/PantryShell";
import JsonLd from "@/components/Seo/JsonLd";
import { shopView } from "@/components/Shop/listing";
import { shopItemList } from "@/components/Shop/structured-data";
import { collectionForCategoryQuery, collectionPath } from "@/components/Shop/collections";
import { loadListedCatalogue } from "@/components/Shop/load-catalogue";
import { breadcrumbJsonLd, shareMetadata } from "@/lib/seo";

const title = "Shop the pantry | Kosvana";
const description = "Shop Kosvana’s Himalayan pantry: dried mushrooms, spices, dry fruits and seeds delivered across India, with fresh mushrooms in Dehradun.";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Filtered, sorted and later pages are views of one listing: they canonicalise to /shop. A filter on one
// category that has its own collection page (/shop?category=spices) canonicalises to that page instead.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const collection = collectionForCategoryQuery(toQuery(await searchParams).get("category") ?? undefined);
  return { title, description, ...shareMetadata({ path: collection ? collectionPath(collection) : "/shop", title, description }) };
}

function toQuery(params: Awaited<SearchParams>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) query.set(key, first);
  }
  return query;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  // Reading the query makes the page render per request, so the first HTML lists the products for this URL.
  const query = toQuery(await searchParams);
  const catalogue = await loadListedCatalogue();
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
