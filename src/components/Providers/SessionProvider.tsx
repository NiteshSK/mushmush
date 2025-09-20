"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthSessionProvider({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render SessionProvider to ensure context is always available
  // The mounting state is handled internally by NextAuth
  return <SessionProvider>{children}</SessionProvider>;
}
