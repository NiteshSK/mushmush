import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopOffers from "@/components/Pantry/ShopOffers";
import PantryShell from "@/components/Pantry/PantryShell";
import JsonLd from "@/components/Seo/JsonLd";
import Collection from "@/components/Shop/Collection";
import { collectionPath, collectionProducts, findCollection } from "@/components/Shop/collections";
import { sortProducts } from "@/components/Shop/listing";
import { loadListedCatalogue } from "@/components/Shop/load-catalogue";
import { shopItemList } from "@/components/Shop/structured-data";
import { breadcrumbJsonLd, shareMetadata } from "@/lib/seo";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const collection = findCollection((await params).category);
  // Unknown slugs 404 here too, so the status is set before any of the page streams.
  if (!collection) notFound();
  const { title, description } = collection;
  // Sorted views (?sort=…) canonicalise to the collection itself.
  return { title, description, ...shareMetadata({ path: collectionPath(collection), title, description }) };
}

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const collection = findCollection((await params).category);
  if (!collection) notFound();
  // Reading the query makes the page render per request, so the first HTML lists today's products.
  await searchParams;
  const catalogue = await loadListedCatalogue();
  const listed = catalogue ? sortProducts(collectionProducts(collection, catalogue), "recommended") : [];
  const path = collectionPath(collection);

  return (
    <PantryShell current="shop" skipTo={{ href: "#products", label: "Skip to products" }}>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: collection.name, path }])} />
      {listed.length > 0 && <JsonLd data={shopItemList(listed, 1, { name: `${collection.name} from Kosvana`, path })} />}
      {/* Without server data the collection loads the products in the browser. */}
      <Collection slug={collection.slug} initialProducts={catalogue} />
      <ShopOffers/>
    </PantryShell>
  );
}
