import React from "react";
import { Metadata } from "next";
import NewsDetails from "@/components/News/NewsDetails";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // For now, return static metadata to avoid API issues during SSR
  // TODO: Implement dynamic metadata once the API is stable
  return {
    title: "News Article | Kosvana",
    description: "Read the latest news from Kosvana",
  };
}

const NewsArticlePage = async ({ params }: Props) => {
  const { slug } = await params;
  return (
    <main>
      <NewsDetails slug={slug} />
    </main>
  );
};

export default NewsArticlePage;
