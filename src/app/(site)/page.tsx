import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kosvana | Premium Mushrooms, Dry Fruits, Seeds & Spices",
  description: "Kosvana brings you premium mushrooms, dry fruits, seeds and spices — naturally grown and sourced from Dehradun, India",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
