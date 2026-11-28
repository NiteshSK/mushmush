import { isFreshMushroom, isGrowProduct, packLabel, productCover, productKind } from "@/components/Pantry/catalogue";
import { plainText } from "@/components/ShopDetails/content";
import { absoluteUrl, SITE_NAME, SITE_URL } from "./site";

/** The product fields the feed reads (a subset of the /api/products shape). */
export type FeedProduct = {
  slug: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  inStock: boolean;
  measurementValue: number;
  measurementType: string;
  fulfillmentClass?: string | null;
  /** Stored as JSON: { cover?, previews?, thumbnails? }. */
  imgs?: unknown;
  categories?: { category: { slug: string; title?: string } }[];
};

const xml = (text: string) => text.replace(/[<>&'"]/g, ch => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[ch] as string));
const money = (amount: number) => `${amount.toFixed(2)} INR`;
const FOOD = "Food, Beverages & Tobacco > Food Items";

/**
 * Whether a product belongs in the Google Merchant Center feed. Fresh mushrooms are left out:
 * they are delivered only in Dehradun, and Shopping listings would offer them across India.
 */
export const inFeed = (product: FeedProduct) => !isFreshMushroom(product);

/** One <item> in Google's RSS 2.0 product data format. */
type Photos = { cover?: string; previews?: string[]; thumbnails?: string[] };
const photos = (product: FeedProduct) => (product.imgs && typeof product.imgs === "object" ? product.imgs as Photos : undefined);

export function feedItem(product: FeedProduct) {
  const imgs = photos(product);
  const images = Array.from(new Set([productCover({ imgs }), ...(imgs?.previews ?? [])].filter((src): src is string => !!src)))
    .map(src => absoluteUrl(src));
  const sale = product.discountedPrice !== null && product.discountedPrice < product.price ? product.discountedPrice : null;
  const description = plainText(product.description || "").replace(/\s+/g, " ").trim().slice(0, 5000) || product.title;
  const fields: [string, string | undefined][] = [
    ["g:id", product.slug],
    ["g:title", `${product.title} ${packLabel(product)}`.slice(0, 150)],
    ["g:description", description],
    ["g:link", absoluteUrl(`/shop-details/${encodeURIComponent(product.slug)}`)],
    ["g:image_link", images[0]],
    ...images.slice(1, 11).map(src => ["g:additional_image_link", src] as [string, string]),
    ["g:availability", product.inStock ? "in_stock" : "out_of_stock"],
    ["g:price", money(product.price)],
    ["g:sale_price", sale !== null ? money(sale) : undefined],
    ["g:brand", SITE_NAME],
    ["g:condition", "new"],
    ["g:identifier_exists", "no"],
    ["g:product_type", productKind(product) ?? undefined],
    ["g:google_product_category", isGrowProduct(product) ? undefined : FOOD],
  ];
  return `    <item>\n${fields.filter(([, value]) => value).map(([name, value]) => `      <${name}>${xml(value as string)}</${name}>`).join("\n")}\n    </item>`;
}

/** The whole feed. Products without a photo are skipped, because Google rejects them. */
export function merchantFeed(products: FeedProduct[]) {
  const items = products.filter(inFeed).filter(p => productCover({ imgs: photos(p) })).map(feedItem);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${xml("Dried mushrooms, spices, dry fruits and seeds from Herbertpur, Dehradun.")}</description>
${items.join("\n")}
  </channel>
</rss>
`;
}
