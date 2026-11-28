/**
 * The site's public identity for search engines: one main domain, and the business facts
 * used in structured data. Other domains (mushmush.in, kosvana.com without www) redirect here.
 */
export const SITE_URL = "https://www.kosvana.com";
export const SITE_NAME = "Kosvana";

/** Absolute URL on the main domain for a path such as "/shop" or "shop-details/cumin-seeds". */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Published business details (the same as the contact page). */
export const BUSINESS = {
  legalName: "Kosvana by Mush Agro Products",
  email: "concierge@kosvana.com",
  telephone: "+917618362662",
  whatsapp: "https://wa.me/917618362662",
  maps: "https://www.google.com/maps/place/Kosvana+by+MushAgroProducts/data=!4m2!3m1!1s0x0:0xc1d016cb5b5c812a",
  address: {
    streetAddress: "NH 507, Herbertpur",
    addressLocality: "Dehradun",
    addressRegion: "Uttarakhand",
    postalCode: "248142",
    addressCountry: "IN",
  },
  logo: "/images/logo/logo.png",
  /** Default image for link previews (1200 x 630). */
  shareImage: "/images/og/kosvana-pantry.jpg",
} as const;
