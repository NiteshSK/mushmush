import React, { Suspense } from "react";
import SearchResults from "@/components/Search/SearchResults";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Search Results | MushMush",
  description: "Search results for MushMush products",
};

const SearchPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={35} mushroomCount={20}>
        <Suspense fallback={<div>Loading search results...</div>}>
          <SearchResults />
        </Suspense>
      </FestiveWrapper>
    </main>
  );
};

export default SearchPage;
