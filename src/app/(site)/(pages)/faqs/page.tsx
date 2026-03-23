import FAQ from "@/components/Home/FAQ";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs | Kosvana",
  description: "Frequently asked questions about Kosvana products, organic mushrooms, dry fruits, seeds, spices, and cultivation training",
};

export default function FAQsPage() {
  return (
    <>
      <Breadcrumb title="FAQs" pages={["FAQs"]} />
      <FAQ />
    </>
  );
}
