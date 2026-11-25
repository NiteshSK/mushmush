import type { Metadata } from "next";
import FaqsPage from "@/components/Help/FaqsPage";
import { getShippingSummary } from "@/components/Help/shipping";
import PantryShell from "@/components/Pantry/PantryShell";

export const metadata: Metadata = {
  title: "FAQs | Kosvana",
  description: "Answers about Kosvana delivery, shipping fees, payment, storing fresh mushrooms and mushroom-growing training.",
};

// Shipping fees come from the shipping_zones table; refresh them hourly.
export const revalidate = 3600;

export default async function FAQsRoute() {
  const shipping = await getShippingSummary();
  return (
    <PantryShell browseHref="/shop">
      <FaqsPage shipping={shipping} />
    </PantryShell>
  );
}
