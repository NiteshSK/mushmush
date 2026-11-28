import type { Metadata } from "next";
import AboutUs from "@/components/AboutUs";
import PantryShell from "@/components/Pantry/PantryShell";
import JsonLd from "@/components/Seo/JsonLd";
import { businessJsonLd, shareMetadata } from "@/lib/seo";

const title = "Our story | Kosvana";
const description = "Kosvana is a Himalayan food shop in Herbertpur, Dehradun, started by three mushroom growers. Fresh mushrooms in Dehradun; dried mushrooms, spices, dry fruits and seeds across India.";

export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/about-us", title, description }) };

export default function AboutPage() {
  return (
    <PantryShell current="story" browseHref="/shop">
      <JsonLd data={businessJsonLd()} />
      <AboutUs />
    </PantryShell>
  );
}
