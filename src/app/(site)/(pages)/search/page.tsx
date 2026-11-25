import { Suspense } from "react";
import type { Metadata } from "next";
import SearchResults from "@/components/Search/SearchResults";
import PantryShell from "@/components/Pantry/PantryShell";
import PantryLoader from "@/components/Pantry/PantryLoader";

export const metadata: Metadata = {
  title: "Search the pantry | Kosvana",
  description: "Search Kosvana’s dried mushrooms, spices, dry fruits and seeds.",
};

export default function SearchPage() {
  return (
    <PantryShell skipTo={{ href: "#results", label: "Skip to results" }} browseHref="/shop">
      <Suspense fallback={<main id="main" aria-busy="true"><PantryLoader /></main>}>
        <SearchResults />
      </Suspense>
    </PantryShell>
  );
}
