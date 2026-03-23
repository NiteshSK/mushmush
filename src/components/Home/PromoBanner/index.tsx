"use client";
import React from "react";
import Link from "next/link";
import { usePromotionalBanners } from "@/hooks/usePromotionalBanners";

const PromoBanner = () => {
  const { banners, loading, currentBannerIndex, setCurrentBannerIndex } = usePromotionalBanners();

  const generateBannerLink = (banner) => {
    if (banner.buttonLink) return banner.buttonLink;
    if (banner.product) return `/shop-details/${banner.product.slug}`;
    if (banner.category) return `/shop?category=${banner.category.slug}`;
    return '#';
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-cream">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0">
          <div className="mb-10 h-10 bg-sand rounded-lg w-1/3 mx-auto animate-pulse"></div>
          <div className="h-[360px] rounded-2xl bg-sand animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <section className="py-12 sm:py-16 bg-cream">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0">
        <div className="mb-10 text-center">
          <h2 className="font-medium text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-bark mb-3">
            Featured
          </h2>
          <p className="text-gray-5 text-base">Exclusive offers on our finest selection</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2 border border-gray-3">
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              {/* Left Column: Content */}
              <div className="mb-8 lg:mb-0 text-center lg:text-left">
                {currentBanner.subtitle && (
                  <span className="inline-block text-xs font-medium uppercase tracking-[0.15em] text-blue mb-4">
                    {currentBanner.subtitle}
                  </span>
                )}

                <h3 className="font-medium text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 sm:mb-6 leading-tight text-dark">
                  {currentBanner.discount || currentBanner.title}
                </h3>

                {currentBanner.description && (
                  <p className="text-base lg:text-lg mb-8 leading-relaxed text-gray-6">
                    {currentBanner.description}
                  </p>
                )}

                <Link
                  href={generateBannerLink(currentBanner)}
                  className="inline-flex items-center gap-2 bg-forest text-white py-3 sm:py-3.5 px-6 sm:px-10 rounded-full text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:bg-dark"
                >
                  <span>{currentBanner.buttonText || "Shop Now"}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Right Column: Image */}
              <div className="flex justify-center items-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square">
                  <div className="absolute inset-0 bg-sand rounded-2xl"></div>
                  <div className="relative z-1 w-full h-full p-6">
                    <img
                      src={currentBanner.imageUrl || "/images/placeholder-mushroom.png"}
                      alt={currentBanner.title || "Special promotional offer"}
                      className="rounded-xl w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Pagination */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-3 text-gray-5 hover:text-dark hover:border-gray-4 transition-all duration-200"
              aria-label="Previous banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <span className="text-sm text-gray-5 font-medium tabular-nums">
              {currentBannerIndex + 1} / {banners.length}
            </span>

            <button
              onClick={() => setCurrentBannerIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-3 text-gray-5 hover:text-dark hover:border-gray-4 transition-all duration-200"
              aria-label="Next banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoBanner;
