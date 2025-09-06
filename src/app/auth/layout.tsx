import type { Metadata } from "next";
import AuthSessionProvider from "@/components/Providers/SessionProvider";
import { Toaster } from "react-hot-toast";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";

export const metadata: Metadata = {
  title: "Authentication - MushMush",
  description: "Sign in to your MushMush account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <Toaster />
      {children}
    </AuthSessionProvider>
  );
}
