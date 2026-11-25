import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireSignIn } from "@/components/MyAccount/requireSignIn";

export const metadata: Metadata = {
  title: "Your addresses | Kosvana",
  description: "Add, edit and choose a default delivery address for Kosvana orders.",
  robots: { index: false },
};

/** Signed-out visitors go to sign-in and come back to /addresses. */
export default async function Layout({ children }: { children: ReactNode }) {
  await requireSignIn("/addresses");
  return children;
}
