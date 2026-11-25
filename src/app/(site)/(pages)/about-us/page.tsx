import type { Metadata } from "next";
import AboutUs from "@/components/AboutUs";
import PantryShell from "@/components/Pantry/PantryShell";

export const metadata: Metadata = {
  title: "Our story | Kosvana",
  description: "Kosvana is a Himalayan food shop in Herbertpur, Dehradun, started by three mushroom growers. Fresh mushrooms in Dehradun; dried mushrooms, spices, dry fruits and seeds across India.",
};

export default function AboutPage() {
  return (
    <PantryShell current="story" browseHref="/shop">
      <AboutUs />
    </PantryShell>
  );
}
