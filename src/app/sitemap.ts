import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";
import { COLLECTIONS, collectionPath } from "@/components/Shop/collections";

// Rebuilt at most once an hour, so new products and articles appear without a deploy.
export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  // Shop collections: /shop/dried-mushrooms, /shop/spices and the others.
  ...COLLECTIONS.map(collection => ({ path: collectionPath(collection), priority: 0.8, changeFrequency: "weekly" as const })),
  { path: "/training", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about-us", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blogs", priority: 0.6, changeFrequency: "weekly" },
  { path: "/faqs", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

/** Every public page Google should know about. News items (headlines from other sites) are left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({ url: absoluteUrl(page.path), lastModified: now, changeFrequency: page.changeFrequency, priority: page.priority }));
  try {
    const [products, posts, programs] = await Promise.all([
      prisma.product.findMany({ where: { archivedAt: null }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.trainingProgram.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
    pages.push(
      ...products.map(p => ({ url: absoluteUrl(`/shop-details/${encodeURIComponent(p.slug)}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...posts.map(p => ({ url: absoluteUrl(`/blogs/${encodeURIComponent(p.slug)}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...programs.map(p => ({ url: absoluteUrl(`/training/${encodeURIComponent(p.slug)}/schedule`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    );
  } catch (error) {
    // A database outage still serves the main pages rather than an error.
    console.error("Sitemap: could not load products, articles or courses", error);
  }
  return pages;
}
