"use client";
import { useState, useEffect } from "react";
import AuthSessionProvider from "@/components/Providers/SessionProvider";

interface ClientRootLayoutProps {
  children: React.ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <AuthSessionProvider>
      <div className={loading ? "overflow-hidden" : ""}>
        {children}
      </div>
    </AuthSessionProvider>
  );
}
