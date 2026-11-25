import type { Metadata } from "next";
import PantryShell from "@/components/Pantry/PantryShell";
import { Wishlist } from "@/components/Wishlist";
import { requireSignIn } from "@/components/MyAccount/requireSignIn";

export const metadata: Metadata = {
  title: "Your wishlist | Kosvana",
  description: "Products you saved at Kosvana, ready to add to your bag.",
  robots: { index: false },
};

export default async function WishlistPage() {
  await requireSignIn("/wishlist");
  return <PantryShell browseHref="/shop"><Wishlist /></PantryShell>;
}
