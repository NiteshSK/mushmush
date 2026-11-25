"use client";

import PantryShell from "@/components/Pantry/PantryShell";
import Orders from "@/components/MyAccount/Orders";

export default function Page() {
  return <PantryShell browseHref="/shop"><Orders /></PantryShell>;
}
