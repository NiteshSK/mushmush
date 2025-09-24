import React from "react";
import Checkout from "@/components/Checkout";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Checkout Page | MushMush",
  description: "This is Checkout Page for MushMush",
};

const CheckoutPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={30} mushroomCount={15}>
        <Checkout />
      </FestiveWrapper>
    </main>
  );
};

export default CheckoutPage;
