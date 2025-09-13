import React, { Suspense } from "react";
import Shop from "@/components/Shop";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop | MushMush",
  description: "Browse our complete mushroom collection with advanced filters",
  // other metadata
};

const ShopPage = () => {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Shop showFilters={true} />
      </Suspense>
    </main>
  );
};

export default ShopPage;
