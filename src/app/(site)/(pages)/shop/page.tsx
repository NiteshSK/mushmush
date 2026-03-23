import React, { Suspense } from "react";
import Shop from "@/components/Shop";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop | Kosvana",
  description: "Browse our complete collection of premium mushrooms, dry fruits, seeds & spices with advanced filters",
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
