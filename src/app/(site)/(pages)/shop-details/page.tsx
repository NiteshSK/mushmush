import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Details Page | Kosvana",
  description: "This is Shop Details Page for Kosvana",
  // other metadata
};

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails key="shop-details" />
    </main>
  );
};

export default ShopDetailsPage;
