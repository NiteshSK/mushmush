"use client";
import { useState, useEffect } from "react";
import AuthSessionProvider from "@/components/Providers/SessionProvider";
import { WishlistProvider } from "@/app/context/WishlistContext";

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
      <WishlistProvider>
        <div className={loading ? "overflow-hidden" : ""}>
          {children}
        </div>
      </WishlistProvider>
    </AuthSessionProvider>
  );
}
