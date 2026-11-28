import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ShopDetails from "@/components/ShopDetails";
import PantryShell from "@/components/Pantry/PantryShell";
import JsonLd from "@/components/Seo/JsonLd";
import { productCover } from "@/components/Pantry/catalogue";
import { summary } from "@/components/ShopDetails/content";
import { breadcrumbJsonLd, productJsonLd, productPath } from "@/components/ShopDetails/structured-data";
import { type CatalogueProduct, findCatalogueProduct } from "@/lib/catalogue-server";
import { BUSINESS, absoluteUrl } from "@/lib/site";
import type { Product } from "@/types/product";

type Props = { params: Promise<{ slug: string }> };

const fallback: Metadata = { title: "Shop the pantry | Kosvana" };
// Metadata must not hold back the page when the database is slow.
const METADATA_WAIT_MS = 2000;

/** One lookup per request, shared by the metadata and the page. */
const getProduct = cache((slug: string) => findCatalogueProduct(slug));

/** The product exactly as /api/products sends it to the browser (dates as text). */
const forBrowser = (product: CatalogueProduct) => JSON.parse(JSON.stringify(product)) as Product;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonical = absoluteUrl(productPath(slug));
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<"timeout">(resolve => { timer = setTimeout(() => resolve("timeout"), METADATA_WAIT_MS); });
    const product = await Promise.race([getProduct(slug), timeout]);
    if (product === "timeout") return { ...fallback, alternates: { canonical } };
    if (!product) return { title: "Product not found | Kosvana", robots: { index: false } };
    const title = `${product.title} | Kosvana`;
    const description = summary(product.description) || undefined;
    const cover = productCover(forBrowser(product));
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        title,
        description,
        url: canonical,
        siteName: "Kosvana",
        images: [{ url: absoluteUrl(cover || BUSINESS.shareImage), alt: product.title }],
      },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    return { ...fallback, alternates: { canonical } };
  } finally {
    clearTimeout(timer);
  }
}

export default async function ShopDetailsPage({ params }: Props) {
  const { slug } = await params;
  let product: CatalogueProduct | null | undefined;
  try {
    product = await getProduct(slug);
  } catch (error) {
    // The database failed: the browser still loads the product from /api/products.
    console.error("Product page lookup failed:", error);
  }
  if (product === null) notFound();
  const initialProduct = product ? forBrowser(product) : undefined;
  return (
    <PantryShell current="shop">
      {initialProduct && <JsonLd data={[productJsonLd(initialProduct), breadcrumbJsonLd(initialProduct)]} />}
      <ShopDetails key={slug} slug={slug} initialProduct={initialProduct} />
    </PantryShell>
  );
}
