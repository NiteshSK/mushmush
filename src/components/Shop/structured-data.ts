import { absoluteUrl } from "@/lib/site";

type Listed = { slug: string; title: string };

/**
 * schema.org ItemList of the products one shop page shows. `firstPosition` continues the
 * numbering on later pages (page 2 starts at 13).
 */
export function shopItemList(products: Listed[], firstPosition = 1) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Kosvana pantry",
    url: absoluteUrl("/shop"),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: firstPosition + index,
      url: absoluteUrl(`/shop-details/${encodeURIComponent(product.slug)}`),
      name: product.title,
    })),
  };
}
