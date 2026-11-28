import type { Metadata } from "next";
import PrivacyPage from "@/components/Legal/PrivacyPage";
import PantryShell from "@/components/Pantry/PantryShell";
import { publicContactDetails } from "@/lib/public-contact";
import { shareMetadata } from "@/lib/seo";

const title = "Privacy policy | Kosvana";
const description = "What personal data Kosvana collects, why, which services handle it, and how to access, correct or erase it.";

export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/privacy", title, description }) };

// Contact details come from global_configs; refresh them hourly.
export const revalidate = 3600;

export default async function PrivacyRoute() {
  const contact = await publicContactDetails();
  return (
    <PantryShell browseHref="/shop">
      <PrivacyPage contact={contact} />
    </PantryShell>
  );
}
