"use client";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store"; // Import store and persistor

import AuthSessionProvider from "@/components/Providers/SessionProvider";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { PreviewSliderProvider } from "@/app/context/PreviewSliderContext";
import { PreviewSliderModal } from "./PreviewSliderModal";


interface ClientRootLayoutProps {
  children: React.ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
      </PersistGate>
    </Provider>
  );
}