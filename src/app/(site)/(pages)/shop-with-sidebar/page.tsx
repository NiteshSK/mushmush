import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop With Sidebar | MushMush",
  description: "This is Shop With Sidebar for MushMush",
  // other metadata
};

const ShopWithSidebarPage = () => {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <ShopWithSidebar />
      </Suspense>
    </main>
  );
};

export default ShopWithSidebarPage;
