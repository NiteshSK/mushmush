import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Crawlers may read the shop and articles; private and transactional pages stay out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/account", "/addresses", "/orders", "/wishlist", "/recently-viewed", "/my-account", "/cart", "/checkout", "/auth/", "/track", "/mail-success", "/error"],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
