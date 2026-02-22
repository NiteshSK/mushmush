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
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import TopBanner from "@/components/TopBanner";

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
      <ModalProvider>
        <QuickViewModalProvider>
          <CartModalProvider>
            <PreviewSliderProvider>
              <LoadingProvider>
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  gutter={8}
                  containerClassName=""
                  containerStyle={{
                    zIndex: 9999999,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                      zIndex: 9999999,
                    },
                    success: {
                      duration: 3000,
                    },
                    error: {
                      duration: 8000,
                    },
                  }}
                />
                {loading && <PreLoader />}
                <TopBanner />
                <Header />
                <div className="pt-[120px]">
                  {children}
                </div>
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
    </ReduxProvider>
  );
}
