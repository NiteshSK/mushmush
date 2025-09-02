"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReduxProvider } from "@/redux/provider";
import { ModalProvider } from "../context/ModalContext";
import { QuickViewModalProvider } from "../context/QuickViewModalContext";
import { LoadingProvider } from "../context/LoadingContext";
import { Toaster } from "react-hot-toast";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import { WishlistProvider } from "../context/WishlistContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <ReduxProvider>
      <WishlistProvider>
        <ModalProvider>
          <QuickViewModalProvider>
            <CartModalProvider>
              <PreviewSliderProvider>
                <LoadingProvider>
                  <Toaster />
                  {loading && <PreLoader />}
                  <Header />
                  {children}
                  <Footer />
                  <ScrollToTop />
                  <PreviewSliderModal />
                  <QuickViewModal />
                  <CartSidebarModal />
                </LoadingProvider>
              </PreviewSliderProvider>
            </CartModalProvider>
          </QuickViewModalProvider>
        </ModalProvider>
      </WishlistProvider>
    </ReduxProvider>
  );
}
