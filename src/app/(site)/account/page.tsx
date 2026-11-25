"use client";

import PantryShell from "@/components/Pantry/PantryShell";
import MyAccount from "@/components/MyAccount";

export default function Page() {
  return <PantryShell browseHref="/shop"><MyAccount path="/account" /></PantryShell>;
}
