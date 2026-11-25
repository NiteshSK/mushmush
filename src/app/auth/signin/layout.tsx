import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Kosvana",
  description: "Sign in to your Kosvana account to see orders, saved items and delivery addresses.",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
