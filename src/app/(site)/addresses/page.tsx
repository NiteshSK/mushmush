"use client";

import PantryShell from "@/components/Pantry/PantryShell";
import Addresses from "@/components/MyAccount/Addresses";

export default function Page() {
  return <PantryShell browseHref="/shop"><Addresses /></PantryShell>;
}
