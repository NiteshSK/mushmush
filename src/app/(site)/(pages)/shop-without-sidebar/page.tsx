import React, { Suspense } from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop Page | MushMush",
  description: "This is Shop Page for MushMush",
  // other metadata
};

const ShopWithoutSidebarPage = () => {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <ShopWithoutSidebar />
      </Suspense>
    </main>
  );
};

export default ShopWithoutSidebarPage;
