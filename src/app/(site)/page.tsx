import Home from "@/components/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kosvana | The Himalayan Pantry",
  description: "Explore Kosvana’s Himalayan pantry. Shop dried mushrooms, spices, dry fruits and seeds across India, with fresh mushroom delivery in Dehradun.",
};

export default function HomePage() {
  return <Home />;
}
