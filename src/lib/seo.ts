import { absoluteUrl, BUSINESS, SITE_NAME, SITE_URL } from "./site";

/** The shop as a local business with an online store (homepage, About and Contact). */
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: absoluteUrl(BUSINESS.logo),
    image: absoluteUrl(BUSINESS.shareImage),
    description: "Mushrooms grown by hand in Herbertpur, Dehradun. Dried mushrooms, spices, dry fruits and seeds sent across India; fresh mushrooms in Dehradun; mushroom-growing training.",
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    address: { "@type": "PostalAddress", ...BUSINESS.address },
    hasMap: BUSINESS.maps,
    areaServed: { "@type": "Country", name: "India" },
    currenciesAccepted: "INR",
  };
}

/** The website itself, linked to the business. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}

/** Breadcrumbs as schema.org BreadcrumbList. Paths are made absolute on the main domain. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

/** Link-preview fields shared by every indexable page. */
export function shareMetadata({ path, title, description, image }: { path: string; title: string; description?: string; image?: string }) {
  const url = absoluteUrl(path);
  const images = [absoluteUrl(image ?? BUSINESS.shareImage)];
  return {
    alternates: { canonical: url },
    openGraph: { type: "website" as const, siteName: SITE_NAME, locale: "en_IN", url, title, description, images },
    twitter: { card: "summary_large_image" as const, title, description, images },
  };
}
