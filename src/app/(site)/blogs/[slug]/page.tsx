import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalArticle } from "@/components/Read/Article";
import { findPost, relatedSearch } from "@/components/Read/data";
import { imageSrc } from "@/components/Read/format";
import JsonLd from "@/components/Seo/JsonLd";
import { breadcrumbJsonLd, shareMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await findPost(slug);
    if (!post) return { title: "Article not found | Kosvana", robots: { index: false } };
    const title = post.metaTitle || `${post.title} | Kosvana`;
    const description = post.metaDescription || post.excerpt || undefined;
    return { title, description, ...shareMetadata({ path: `/blogs/${post.slug}`, title, description, image: imageSrc(post.img) ?? undefined }) };
  } catch {
    return { title: "Journal | Kosvana" };
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  // Drafts are not public. A database failure reaches blogs/error.tsx instead of posing as "not found".
  const post = await findPost(slug);
  if (!post) notFound();
  const image = imageSrc(post.img);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: image ? [absoluteUrl(image)] : undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl(`/blogs/${post.slug}`),
    author: { "@type": "Organization", name: "Kosvana", url: absoluteUrl("/") },
    publisher: { "@id": absoluteUrl("/#business") },
  };
  return <>
    <JsonLd data={[article, breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Journal", path: "/blogs" }, { name: post.title, path: `/blogs/${post.slug}` }])]} />
    <JournalArticle post={post} topic={await relatedSearch(post.title)} />
  </>;
}
