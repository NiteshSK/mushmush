import type { ReactNode } from "react";
import PantryShell from "@/components/Pantry/PantryShell";

/** Every /blogs page, including recovery and redirect pages, renders inside the pantry shell. */
export default function JournalLayout({ children }: { children: ReactNode }) {
  return <PantryShell browseHref="/shop">{children}</PantryShell>;
}
