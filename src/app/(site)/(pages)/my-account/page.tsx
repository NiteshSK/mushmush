import type { Metadata } from "next";
import PantryShell from "@/components/Pantry/PantryShell";
import MyAccount from "@/components/MyAccount";
import { requireSignIn } from "@/components/MyAccount/requireSignIn";

export const metadata: Metadata = {
  title: "Your account | Kosvana",
  description: "Your Kosvana orders, saved addresses, wishlist and account details.",
  robots: { index: false },
};

// The footer links here; it shows the same overview as /account.
export default async function MyAccountPage() {
  await requireSignIn("/my-account");
  return <PantryShell browseHref="/shop"><MyAccount path="/my-account" /></PantryShell>;
}
