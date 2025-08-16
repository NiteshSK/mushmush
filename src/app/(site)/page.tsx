import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MushMush | Fresh Edible and Medicinal Mushrooms",
  description: "MushMush is a platform for buying and selling fresh edible and medicinal mushrooms.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
