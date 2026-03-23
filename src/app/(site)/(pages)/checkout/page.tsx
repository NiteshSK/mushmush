import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Checkout Page | Kosvana",
  description: "This is Checkout Page for Kosvana",
};

const CheckoutPage = () => {
  return (
    <main>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
