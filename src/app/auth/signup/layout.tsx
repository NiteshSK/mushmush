import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account | Kosvana",
  description: "Create a Kosvana account to save addresses, follow orders and keep a wishlist.",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
