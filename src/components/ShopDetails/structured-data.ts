import type { Product } from "@/types/product";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { isFreshMushroom } from "../Pantry/catalogue";
import { plainText } from "./content";
import { sellablePackLimit } from "@/lib/inventory";
import { allPhotos, shelf } from "./product-facts";

/**
 * schema.org structured data for one product page: the Product with its offer, and the breadcrumb.
 * Pure: it reads the product as /api/products serves it (price already discounted by the shared
 * pricing rules) and invents nothing. Ratings are left out: the review table has no moderation
 * state, so it cannot tell real customer reviews from sample ones.
 */

type PageProduct = Omit<Product, "discountedPrice"> & { discountedPrice?: number | null; fulfillmentClass?: string | null };

export const productPath = (slug: string) => `/shop-details/${slug}`;

/** Price as schema.org wants it: a plain number, no currency sign or thousands separator. */
const priceText = (price: number) => (Number.isInteger(price) ? String(price) : price.toFixed(2));

export function productJsonLd(product: PageProduct) {
  const url = absoluteUrl(productPath(product.slug));
  // The shopper pays the discounted price when one applies (computeProductDiscount in src/lib/product-pricing.ts).
  const price = product.discountedPrice ?? product.price;
  const stock = sellablePackLimit(product);
  const description = plainText(product.description ?? "");
  const seller = { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(description && { description }),
    image: allPhotos(product).map(src => absoluteUrl(src)),
    sku: product.slug,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: priceText(price),
      ...(stock !== null && { availability: stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" }),
      itemCondition: "https://schema.org/NewCondition",
      seller,
      // Fresh mushrooms are delivered in Dehradun only.
      ...(isFreshMushroom(product) && { areaServed: { "@type": "City", name: "Dehradun" } }),
    },
  };
}

/** Home → Shop → shelf (when the product has one) → product, the same trail as the visible breadcrumb. */
export function breadcrumbJsonLd(product: PageProduct) {
  const category = shelf(product as Product);
  const trail = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(category ? [{ name: category.title, path: category.href }] : []),
    { name: product.title, path: productPath(product.slug) },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(({ name, path }, index) => ({ "@type": "ListItem", position: index + 1, name, item: absoluteUrl(path) })),
  };
}
