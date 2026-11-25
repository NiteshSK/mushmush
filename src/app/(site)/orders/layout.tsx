import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireSignIn } from "@/components/MyAccount/requireSignIn";

export const metadata: Metadata = {
  title: "Your orders | Kosvana",
  description: "Follow payment, preparation and delivery for your Kosvana orders.",
  robots: { index: false },
};

/** Signed-out visitors go to sign-in and come back to /orders. */
export default async function Layout({ children }: { children: ReactNode }) {
  await requireSignIn("/orders");
  return children;
}
