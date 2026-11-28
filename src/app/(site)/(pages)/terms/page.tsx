import type { Metadata } from "next";
import { getShippingSummary } from "@/components/Help/shipping";
import TermsPage from "@/components/Legal/TermsPage";
import PantryShell from "@/components/Pantry/PantryShell";
import { publicContactDetails } from "@/lib/public-contact";
import { shareMetadata } from "@/lib/seo";

const title = "Terms of sale | Kosvana";
const description = "How ordering, prices, UPI payment, delivery, cancellation, returns and complaints work at Kosvana.";

export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/terms", title, description }) };

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
