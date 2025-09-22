import FAQ from "@/components/Home/FAQ";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs | MushMush",
  description: "Frequently asked questions about MushMush organic mushrooms, cultivation training, and our products",
};

export default function FAQsPage() {
  return (
    <>
      <FAQ />
    </>
  );
}
