import React, { Suspense } from "react";
import SearchResults from "@/components/Search/SearchResults";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Search Results | MushMush",
  description: "Search results for MushMush products",
};

const SearchPage = () => {
  return (
    <main>
      <Suspense fallback={<div>Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
};

export default SearchPage;
