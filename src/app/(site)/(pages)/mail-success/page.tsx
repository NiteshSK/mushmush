import type { Metadata } from "next";
import MailSuccess from "@/components/MailSuccess";
import PantryShell from "@/components/Pantry/PantryShell";

export const metadata: Metadata = {
  title: "Message sent | Kosvana",
  description: "Your message to Kosvana is sent.",
  robots: { index: false },
};

export default function MailSuccessPage() {
  return (
    <PantryShell browseHref="/shop">
      <MailSuccess />
    </PantryShell>
  );
}
