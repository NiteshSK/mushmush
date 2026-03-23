import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | Kosvana",
  description: "Contact Kosvana for inquiries about our premium mushrooms, dry fruits, seeds, spices, and training programs",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
