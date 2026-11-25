import type { Metadata } from "next";
import ShopDetails from "@/components/ShopDetails";
import PantryShell from "@/components/Pantry/PantryShell";

export const metadata: Metadata = {
  title: "Product details | Kosvana",
  description: "Choose a product from Kosvana’s Himalayan pantry to see its pack size, price and delivery.",
  robots: { index: false },
};

/** The older entry without a slug. It forwards to the product chosen on a legacy page, or offers ways to find one. */
export default function ShopDetailsEntry() {
  return (
    <PantryShell current="shop">
      <ShopDetails />
    </PantryShell>
  );
}
