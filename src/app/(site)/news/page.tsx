import type { Metadata } from "next";
import { NewsIndex } from "@/components/Read/Listing";
import { pageNumber } from "@/components/Read/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mushroom news | Kosvana",
  description: "Recent headlines about mushrooms and fungi from other publications, collected by Kosvana.",
};

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default async function NewsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  return <NewsIndex page={pageNumber(page)} />;
}
