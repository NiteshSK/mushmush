import type { Metadata } from "next";
import { getShippingSummary } from "@/components/Help/shipping";
import TermsPage from "@/components/Legal/TermsPage";
import PantryShell from "@/components/Pantry/PantryShell";
import { publicContactDetails } from "@/lib/public-contact";

export const metadata: Metadata = {
  title: "Terms of sale | Kosvana",
  description: "How ordering, prices, UPI payment, delivery, cancellation, returns and complaints work at Kosvana.",
};

// Contact details come from global_configs and fees from shipping_zones; refresh them hourly.
export const revalidate = 3600;

export default async function TermsRoute() {
  const [contact, shipping] = await Promise.all([publicContactDetails(), getShippingSummary()]);
  return (
    <PantryShell browseHref="/shop">
      <TermsPage contact={contact} shipping={shipping} />
    </PantryShell>
  );
}
