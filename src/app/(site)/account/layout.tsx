import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireSignIn } from "@/components/MyAccount/requireSignIn";

export const metadata: Metadata = {
  title: "Your account | Kosvana",
  description: "Your Kosvana orders, saved addresses, wishlist and account details.",
  robots: { index: false },
};

/** Signed-out visitors go to sign-in and come back to /account. */
export default async function Layout({ children }: { children: ReactNode }) {
  await requireSignIn("/account");
  return children;
}
