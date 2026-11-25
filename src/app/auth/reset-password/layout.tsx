import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose a new password | Kosvana",
  description: "Choose a new password for your Kosvana account.",
  robots: { index: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
