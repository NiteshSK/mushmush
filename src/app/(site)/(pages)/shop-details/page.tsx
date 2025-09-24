import React from "react";
import ShopDetails from "@/components/ShopDetails";
import FestiveWrapper from "@/components/FestiveWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Details Page | MushMush",
  description: "This is Shop Details Page for MushMush",
  // other metadata
};

const ShopDetailsPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={45} mushroomCount={30}>
        <ShopDetails key="shop-details" />
      </FestiveWrapper>
    </main>
  );
};

export default ShopDetailsPage;
