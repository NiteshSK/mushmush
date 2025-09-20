import React from "react";
import { Wishlist } from "@/components/Wishlist";
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
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
