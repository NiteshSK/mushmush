import React from "react";
import { Wishlist } from "@/components/Wishlist";
import FestiveWrapper from "@/components/FestiveWrapper";
import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Wishlist Page | MushMush",
  description: "This is Wishlist Page for MushMush",
};

const WishlistPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={35} mushroomCount={20}>
        <Wishlist />
      </FestiveWrapper>
    </main>
  );
};

export default WishlistPage;
