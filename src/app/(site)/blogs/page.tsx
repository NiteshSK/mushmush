import type { Metadata } from "next";
import { JournalIndex } from "@/components/Read/Listing";
import { pageNumber } from "@/components/Read/format";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Journal | Kosvana";
const description = "Step-by-step guides to growing and cooking mushrooms at home, from Kosvana in Herbertpur, Dehradun.";

export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/blogs", title, description }) };

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default async function JournalPage({ searchParams }: Props) {
  const { page } = await searchParams;
  return <JournalIndex page={pageNumber(page)} />;
}
