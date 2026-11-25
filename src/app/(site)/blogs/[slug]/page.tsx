import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalArticle } from "@/components/Read/Article";
import { findPost, relatedSearch } from "@/components/Read/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await findPost(slug);
    if (!post) return { title: "Article not found | Kosvana" };
    return { title: `${post.title} | Kosvana`, description: post.excerpt || undefined };
  } catch {
    return { title: "Journal | Kosvana" };
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  // Drafts are not public. A database failure reaches blogs/error.tsx instead of posing as "not found".
  const post = await findPost(slug);
  if (!post) notFound();
  return <JournalArticle post={post} topic={await relatedSearch(post.title)} />;
}
