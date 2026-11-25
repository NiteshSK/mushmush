import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticle } from "@/components/Read/Article";
import { findNewsItem, relatedSearch } from "@/components/Read/data";
import { splitPublisher } from "@/components/Read/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await findNewsItem(slug);
    if (!item) return { title: "Story not found | Kosvana" };
    const title = item.source === "scraped" ? splitPublisher(item.title).headline : item.title;
    return { title: `${title} | Kosvana news`, description: item.source === "scraped" ? undefined : item.excerpt || undefined };
  } catch {
    return { title: "Mushroom news | Kosvana" };
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const item = await findNewsItem(slug);
  if (!item) notFound();
  const topic = item.source === "scraped" ? null : await relatedSearch(item.title);
  return <NewsArticle item={item} topic={topic} />;
}
