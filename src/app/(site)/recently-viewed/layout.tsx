import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireSignIn } from "@/components/MyAccount/requireSignIn";

export const metadata: Metadata = {
  title: "Recently viewed | Kosvana",
  description: "The Kosvana products you opened most recently.",
  robots: { index: false },
};

/** Signed-out visitors go to sign-in and come back to /recently-viewed. */
export default async function Layout({ children }: { children: ReactNode }) {
  await requireSignIn("/recently-viewed");
  return children;
}
