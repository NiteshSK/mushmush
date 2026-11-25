import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign-in problem | Kosvana",
  description: "We couldn’t sign you in to Kosvana.",
  robots: { index: false },
};

export default function AuthErrorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
