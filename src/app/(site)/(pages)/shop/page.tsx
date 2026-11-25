import ShopOffers from "@/components/Pantry/ShopOffers";
import { Suspense } from "react";
import type { Metadata } from "next";
import Shop from "@/components/Shop";
import PantryShell from "@/components/Pantry/PantryShell";
import PantryLoader from "@/components/Pantry/PantryLoader";

export const metadata: Metadata = {
  title: "Shop the pantry | Kosvana",
  description: "Shop Kosvana’s Himalayan pantry: dried mushrooms, spices, dry fruits and seeds delivered across India, with fresh mushrooms in Dehradun.",
};

export default function ShopPage() {
  return (
    <PantryShell current="shop" skipTo={{ href: "#products", label: "Skip to products" }}>
      <Suspense fallback={<main id="main" aria-busy="true"><PantryLoader /></main>}>
        <Shop />
      </Suspense>
      <ShopOffers/>
    </PantryShell>
  );
}
