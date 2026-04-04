"use client";
import React, { useState, useEffect } from "react";
import { usePromotionalBanners } from "@/hooks/usePromotionalBanners";

const FALLBACK = [
    "Free Delivery on orders above ₹1999",
    "Use code KOSVANA10 for 10% off your first order",
    "100% Natural & Sustainably Sourced Products",
];

const TopBanner = () => {
    const { banners, loading, currentBannerIndex, setCurrentBannerIndex } =
        usePromotionalBanners();
    const [fallbackIdx, setFallbackIdx] = useState(0);

    const usingFallback = !loading && banners.length === 0;
    const messages: string[] = usingFallback
        ? FALLBACK
        : banners.map((b) => [b.discount, b.title].filter(Boolean).join(" — "));

    const activeIdx = usingFallback ? fallbackIdx : currentBannerIndex;
    const total = messages.length;

    const prev = () => {
        if (usingFallback) setFallbackIdx((i) => (i === 0 ? total - 1 : i - 1));
        else setCurrentBannerIndex((i) => (i === 0 ? total - 1 : i - 1));
    };
    const next = () => {
        if (usingFallback) setFallbackIdx((i) => (i === total - 1 ? 0 : i + 1));
        else setCurrentBannerIndex((i) => (i === total - 1 ? 0 : i + 1));
    };

    // Auto-rotate fallbacks
    useEffect(() => {
        if (!usingFallback || total <= 1) return;
        const t = setInterval(() => setFallbackIdx((i) => (i === total - 1 ? 0 : i + 1)), 5000);
        return () => clearInterval(t);
    }, [usingFallback, total]);

    if (loading) return null;

    return (
        <div className="bg-forest text-white w-full fixed top-0 left-0 z-[99999]">
            <div className="max-w-[1200px] mx-auto px-4 h-10 flex items-center">
                {/* Left – phone number */}
                <a
                    href="tel:+917618362662"
                    className="hidden md:flex items-center gap-1.5 text-white font-medium hover:text-white/80 transition-colors flex-shrink-0"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4.7177 3.09215C5.94388 1.80121 7.9721 2.04307 8.98569 3.47665L10.2467 5.26014C11.0574 6.4068 10.9889 8.00097 10.0214 9.01965L9.7765 9.27743C9.77582 9.27921 9.7751 9.28115 9.77436 9.28323C9.76142 9.31959 9.7287 9.43538 9.7609 9.65513C9.82765 10.1107 10.1793 11.0364 11.607 12.5394C13.0391 14.0472 13.9078 14.4025 14.3103 14.4679C14.484 14.4961 14.5748 14.4716 14.6038 14.4614L15.0124 14.0312C15.8862 13.1113 17.2485 12.9301 18.347 13.5623L20.2575 14.662C21.8904 15.6019 22.2705 17.9011 20.9655 19.275L19.545 20.7705C19.1016 21.2373 18.497 21.6358 17.75 21.7095C15.9261 21.8895 11.701 21.655 7.27161 16.9917C3.13844 12.6403 2.35326 8.85538 2.25401 7.00615C2.20497 6.09248 2.61224 5.30879 3.1481 4.74464L4.7177 3.09215Z" />
                    </svg>
                    <span className="text-[11px] tracking-wide">(+91) 7618362662</span>
                </a>

                {/* Center – promo message + arrows */}
                <div className="flex-1 flex items-center justify-center relative">
                    {total > 1 && (
                        <button
                            onClick={prev}
                            aria-label="Previous"
                            className="absolute left-0 text-white/50 hover:text-white transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                    )}
                    <p className="text-[11px] sm:text-[12px] tracking-wide text-center px-6">
                        {messages[activeIdx]}
                    </p>
                    {total > 1 && (
                        <button
                            onClick={next}
                            aria-label="Next"
                            className="absolute right-0 text-white/50 hover:text-white transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Right – phone number */}
                <a
                    href="tel:+917618362662"
                    className="hidden md:flex items-center gap-1.5 text-white font-medium hover:text-white/80 transition-colors flex-shrink-0"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4.7177 3.09215C5.94388 1.80121 7.9721 2.04307 8.98569 3.47665L10.2467 5.26014C11.0574 6.4068 10.9889 8.00097 10.0214 9.01965L9.7765 9.27743C9.77582 9.27921 9.7751 9.28115 9.77436 9.28323C9.76142 9.31959 9.7287 9.43538 9.7609 9.65513C9.82765 10.1107 10.1793 11.0364 11.607 12.5394C13.0391 14.0472 13.9078 14.4025 14.3103 14.4679C14.484 14.4961 14.5748 14.4716 14.6038 14.4614L15.0124 14.0312C15.8862 13.1113 17.2485 12.9301 18.347 13.5623L20.2575 14.662C21.8904 15.6019 22.2705 17.9011 20.9655 19.275L19.545 20.7705C19.1016 21.2373 18.497 21.6358 17.75 21.7095C15.9261 21.8895 11.701 21.655 7.27161 16.9917C3.13844 12.6403 2.35326 8.85538 2.25401 7.00615C2.20497 6.09248 2.61224 5.30879 3.1481 4.74464L4.7177 3.09215Z" />
                    </svg>
                    <span className="text-[11px] tracking-wide">(+91) 7618362662</span>
                </a>
            </div>
        </div>
    );
};

export default TopBanner;
