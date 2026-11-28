/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import robots from "@/app/robots";
import { breadcrumbJsonLd, businessJsonLd, shareMetadata } from "@/lib/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: jest.fn() },
    blogPost: { findMany: jest.fn() },
    trainingProgram: { findMany: jest.fn() },
  },
}));
import { prisma } from "@/lib/prisma";
import sitemap from "@/app/sitemap";

const request = (host: string, path: string) => new NextRequest(`http://${host}${path}`, { headers: { host } });

describe("main-domain redirect", () => {
  it.each(["mushmush.in", "www.mushmush.in", "kosvana.com"])("moves pages on %s to www.kosvana.com with the query", host => {
    const response = middleware(request(host, "/shop?category=spices"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://www.kosvana.com/shop?category=spices");
  });

  it("leaves API routes on old domains alone, so sign-in callbacks and webhooks keep working", () => {
    expect(middleware(request("mushmush.in", "/api/auth/callback/google")).headers.get("location")).toBeNull();
  });

  it("does not redirect the main domain", () => {
    expect(middleware(request("www.kosvana.com", "/shop")).headers.get("location")).toBeNull();
  });
});

describe("robots and sitemap", () => {
  it("points crawlers at the sitemap and keeps private pages out", () => {
    const rules = robots();
    expect(rules.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    const disallow = ([] as string[]).concat((rules.rules as { disallow: string[] }[])[0].disallow);
    expect(disallow).toEqual(expect.arrayContaining(["/admin", "/api/", "/checkout", "/account"]));
  });

  it("lists main pages, products, published articles and active courses", async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([{ slug: "cumin-seeds", updatedAt: new Date("2026-11-01") }]);
    (prisma.blogPost.findMany as jest.Mock).mockResolvedValue([{ slug: "unlock-the-umami", updatedAt: new Date("2026-10-01") }]);
    (prisma.trainingProgram.findMany as jest.Mock).mockResolvedValue([{ slug: "oyster-mushroom-training", updatedAt: new Date("2026-09-01") }]);
    const urls = (await sitemap()).map(entry => entry.url);
    expect(urls).toEqual(expect.arrayContaining([
      `${SITE_URL}/`, `${SITE_URL}/shop`, `${SITE_URL}/shop-details/cumin-seeds`,
      `${SITE_URL}/blogs/unlock-the-umami`, `${SITE_URL}/training/oyster-mushroom-training/schedule`,
    ]));
    expect(urls.every(url => url.startsWith(SITE_URL))).toBe(true);
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { archivedAt: null } }));
    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { published: true } }));
  });

  it("still lists the main pages when the database fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    (prisma.product.findMany as jest.Mock).mockRejectedValue(new Error("down"));
    const urls = (await sitemap()).map(entry => entry.url);
    expect(urls).toContain(`${SITE_URL}/shop`);
  });
});

describe("structured data helpers", () => {
  it("builds absolute URLs on the main domain", () => {
    expect(absoluteUrl("/shop")).toBe("https://www.kosvana.com/shop");
    expect(absoluteUrl("shop")).toBe("https://www.kosvana.com/shop");
    expect(absoluteUrl("https://cdn.example/a.png")).toBe("https://cdn.example/a.png");
  });

  it("describes the business with its address and phone", () => {
    const business = businessJsonLd();
    expect(business["@type"]).toBe("Store");
    expect(business.address).toMatchObject({ addressLocality: "Dehradun", postalCode: "248142", addressCountry: "IN" });
    expect(business.telephone).toBe("+917618362662");
  });

  it("numbers breadcrumbs and gives each an absolute URL", () => {
    expect(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }]).itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kosvana.com/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://www.kosvana.com/shop" },
    ]);
  });

  it("sets the canonical address and a share image for each page", () => {
    const meta = shareMetadata({ path: "/faqs", title: "FAQs | Kosvana" });
    expect(meta.alternates.canonical).toBe("https://www.kosvana.com/faqs");
    expect(meta.openGraph.images).toEqual(["https://www.kosvana.com/images/og/kosvana-pantry.jpg"]);
  });
});
