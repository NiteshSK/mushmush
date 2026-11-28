import { listCatalogueProducts } from "@/lib/catalogue-server";
import { merchantFeed } from "@/lib/merchant-feed";

// Google Merchant Center fetches this on a schedule; prices and stock come from the live catalogue.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { products } = await listCatalogueProducts();
    return new Response(merchantFeed(products), {
      headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("Merchant feed: could not load products", error);
    // A 503 makes Merchant Center retry later instead of treating the catalogue as empty.
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "Retry-After": "600" } });
  }
}
