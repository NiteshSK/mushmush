import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password | Kosvana",
  description: "Get a link to reset the password for your Kosvana account.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
