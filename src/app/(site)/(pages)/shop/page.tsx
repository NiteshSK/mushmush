import React, { Suspense } from "react";
import Shop from "@/components/Shop";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop | MushMush",
  description: "Browse our complete mushroom collection with advanced filters",
  // other metadata
};

const ShopPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={40} mushroomCount={25}>
        <Suspense fallback={<div>Loading...</div>}>
          <Shop showFilters={true} />
        </Suspense>
      </FestiveWrapper>
    </main>
  );
};

export default ShopPage;
