import { absoluteUrl } from "@/lib/site";

type Listed = { slug: string; title: string };

/**
 * schema.org ItemList of the products one shop page shows. `firstPosition` continues the
 * numbering on later pages (page 2 starts at 13). A collection page passes its own name and path.
 */
export function shopItemList(products: Listed[], firstPosition = 1, list: { name: string; path: string } = { name: "The Kosvana pantry", path: "/shop" }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.name,
    url: absoluteUrl(list.path),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: firstPosition + index,
      url: absoluteUrl(`/shop-details/${encodeURIComponent(product.slug)}`),
      name: product.title,
    })),
  };
}
