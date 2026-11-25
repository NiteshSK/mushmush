import { prisma } from "@/lib/prisma";
import { searchCatalogue } from "@/components/Pantry/catalogue";
import { PAGE_SIZE, articleTopic } from "./format";

/** Published journal posts, newest first. Drafts never reach the public pages. */
export async function listPosts(page: number) {
  const where = { published: true };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      select: { id: true, slug: true, title: true, excerpt: true, img: true, createdAt: true },
    }),
    prisma.blogPost.count({ where }),
  ]);
  return { posts, total };
}

export const findPost = (slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, published: true } });

/** Published news, newest first. */
export async function listNews(page: number) {
  const where = { published: true };
  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      select: { id: true, slug: true, title: true, excerpt: true, createdAt: true, source: true, sourceUrl: true },
    }),
    prisma.news.count({ where }),
  ]);
  return { news, total };
}

export const findNewsItem = (slug: string) =>
  prisma.news.findFirst({ where: { slug, published: true } });

/**
 * The shop search an article can end with, e.g. "shiitake". It is offered only when the article
 * title names a mushroom and the catalogue search finds at least one product for it, so the link
 * never leads to an empty result. Returns null otherwise, or when the catalogue cannot be read.
 */
export async function relatedSearch(title: string) {
  const topic = articleTopic(title);
  if (!topic) return null;
  try {
    const products = await prisma.product.findMany({
      where: { archivedAt: null },
      select: { title: true, description: true, measurementValue: true, measurementType: true, categories: { select: { category: { select: { slug: true, title: true } } } } },
    });
    return searchCatalogue(products, topic).length ? topic : null;
  } catch {
    return null;
  }
}
