"use client";

import { useState, useEffect } from "react";
import AuthSessionProvider from "@/components/Providers/SessionProvider";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { PreviewSliderProvider } from "@/app/context/PreviewSliderContext";
import { PreviewSliderModal } from "@/components/PreviewSliderModal";

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
        <PreviewSliderProvider>
          <div className={loading ? "overflow-hidden" : ""}>
            {children}
          </div>
          <PreviewSliderModal />
        </PreviewSliderProvider>
      </WishlistProvider>
    </AuthSessionProvider>
  );
}