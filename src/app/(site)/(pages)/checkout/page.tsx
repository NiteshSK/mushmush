import type { Metadata } from "next";
import Checkout from "@/components/Checkout";
import PantryShell from "@/components/Pantry/PantryShell";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | Kosvana",
  description: "Add your contact details and delivery address, verify your email and pay by UPI.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <PantryShell skipTo={{ href: "#main", label: "Skip to checkout" }} browseHref="/shop">
      <Checkout />
    </PantryShell>
  );
}
