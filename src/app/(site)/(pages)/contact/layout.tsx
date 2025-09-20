import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | MushMush",
  description: "Contact MushMush for inquiries about edible and medicinal mushrooms",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
