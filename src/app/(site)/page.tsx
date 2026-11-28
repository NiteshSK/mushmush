import Home from "@/components/Home";
import type { Metadata } from "next";
import JsonLd from "@/components/Seo/JsonLd";
import { businessJsonLd, shareMetadata, websiteJsonLd } from "@/lib/seo";

const title = "Kosvana | Himalayan pantry: dried mushrooms, spices and dry fruits";
const description = "Explore Kosvana’s Himalayan pantry. Shop dried mushrooms, spices, dry fruits and seeds across India, with fresh mushroom delivery in Dehradun.";

export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/", title, description }) };

export default function HomePage() {
  return <>
    <JsonLd data={[businessJsonLd(), websiteJsonLd()]} />
    <Home />
  </>;
}
