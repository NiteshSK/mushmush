"use client";
import { usePathname } from "next/navigation";
import { hidesChat, isPantryRoute } from "@/components/Pantry/routes";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store"; // Import store and persistor

import AuthSessionProvider from "@/components/Providers/SessionProvider";
import { WishlistProvider } from "@/app/context/WishlistContext";
import ChatBot from "./AI/ChatBot";
import CartOwnerSync from "@/components/Pantry/CartOwnerSync";
import VisitTracker from "@/components/VisitAnalytics/VisitTracker";


interface ClientRootLayoutProps {
  children: React.ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const pathname = usePathname();
  // Pantry routes render their own shell and read the persisted bag after it rehydrates.
  const pantry = isPantryRoute(pathname);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {(ready: boolean) => (pantry || ready) && <AuthSessionProvider>
          {/* Mount after rehydration, or the rehydrated bag overwrites what it sets. */}
          {ready && <CartOwnerSync />}
          <WishlistProvider>
            {!pathname?.startsWith("/admin") && <VisitTracker />}
            <div className={!pantry && loading ? "overflow-hidden" : ""}>
              {children}
            </div>
            {/* The floating chat launcher covers Add buttons on phones; shopping grids leave it out. */}
            {!pathname?.startsWith("/admin") && !hidesChat(pathname) && <ChatBot />}
          </WishlistProvider>
        </AuthSessionProvider>}
      </PersistGate>
    </Provider>
  );
}
