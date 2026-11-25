"use client";

import PantryShell from "@/components/Pantry/PantryShell";
import RecentlyViewed from "@/components/RecentlyViewed";

export default function Page() {
  return <PantryShell browseHref="/shop"><RecentlyViewed /></PantryShell>;
}
