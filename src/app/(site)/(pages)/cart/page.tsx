import React from "react";
import Cart from "@/components/Cart";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cart Page | MushMush",
  description: "This is Cart Page for MushMush",
  // other metadata
};

const CartPage = () => {
  return (
    <>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={35} mushroomCount={20}>
        <Cart />
      </FestiveWrapper>
    </>
  );
};

export default CartPage;
