import type { Metadata } from "next";
import Cart from "@/components/Cart";
import PantryShell from "@/components/Pantry/PantryShell";

export const metadata: Metadata = {
  title: "Your bag | Kosvana",
  description: "Review the packs in your Kosvana bag, check delivery to your PIN and go to checkout.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <PantryShell skipTo={{ href: "#main", label: "Skip to your bag" }} browseHref="/shop">
      <Cart />
    </PantryShell>
  );
}
