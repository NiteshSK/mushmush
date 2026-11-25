import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your account | Kosvana",
  description: "Sign in to your Kosvana account",
};

/**
 * The root layout already provides the session, the Redux store and the fonts.
 * Each sign-in, sign-up and recovery page renders <PantryShell>, which brings the
 * masthead, footer and toaster, so this layout adds nothing around them.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
