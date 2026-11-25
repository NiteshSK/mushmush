import type { Metadata } from "next";
import { JournalIndex } from "@/components/Read/Listing";
import { pageNumber } from "@/components/Read/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal | Kosvana",
  description: "Step-by-step guides to growing and cooking mushrooms at home, from Kosvana in Herbertpur, Dehradun.",
};

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default async function JournalPage({ searchParams }: Props) {
  const { page } = await searchParams;
  return <JournalIndex page={pageNumber(page)} />;
}
