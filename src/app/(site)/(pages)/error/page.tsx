import type { Metadata } from "next";
import ErrorRecovery from "@/components/Error";
import PantryShell from "@/components/Pantry/PantryShell";

export const metadata: Metadata = {
  title: "Page not available | Kosvana",
  description: "This page isn’t available. Search the Kosvana pantry, browse the shop or contact us.",
  robots: { index: false },
};

export default function ErrorPage() {
  return (
    <PantryShell browseHref="/shop">
      <ErrorRecovery />
    </PantryShell>
  );
}
