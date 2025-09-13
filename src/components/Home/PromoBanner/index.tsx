"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PromotionalBanner } from "@/types/promotional-banner";
import { usePromotionalBanners } from "@/hooks/usePromotionalBanners";

const PromoBanner = () => {
  const { banners, loading, currentBannerIndex, setCurrentBannerIndex } = usePromotionalBanners();

  const generateBannerLink = (banner: PromotionalBanner): string => {
    if (banner.buttonLink) {
      return banner.buttonLink;
    }
    if (banner.product) {
      return `/shop-details?id=${banner.product.id}`;
    }
    if (banner.category) {
      return `/shop?category=${banner.category.slug}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <section className="overflow-hidden">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* --- Skeleton Loader for Title --- */}
          <div className="mb-8">
            <div className="h-5 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-7 bg-gray-300 rounded w-48 animate-pulse"></div>
          </div>
          
          <div className="relative z-1 overflow-hidden rounded-lg bg-gray-200 animate-pulse py-8 lg:py-12 xl:py-16 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-4">
            <div className="max-w-[550px] w-full">
              <div className="h-6 bg-gray-300 rounded mb-3 w-48"></div>
              <div className="h-8 bg-gray-300 rounded mb-5 w-64"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-300 rounded mb-6 w-3/4"></div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render anything if no banners
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <section className="overflow-hidden pt-20 pb-0">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* --- ADDED: Title Section --- */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Special Offers
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Promotions
            </h2>
          </div>
        </div>

        {/* Dynamic promotional banner */}
        <div 
          className="relative z-1 overflow-hidden rounded-lg py-8 lg:py-12 xl:py-16 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-4"
          style={{ 
            backgroundColor: currentBanner.bgColor,
            color: currentBanner.textColor 
          }}
        >
          <div className="max-w-[550px] w-full">
            {currentBanner.subtitle && (
              <span className="block font-medium text-xl mb-3">
                {currentBanner.subtitle}
              </span>
            )}

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 mb-5">
              {currentBanner.discount || currentBanner.title}
            </h2>

            {currentBanner.description && (
              <p className="mb-6">
                {currentBanner.description}
              </p>
            )}

            <Link
              href={generateBannerLink(currentBanner)}
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              {currentBanner.buttonText}
            </Link>
          </div>

          <Image
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-26 -z-1 rounded-lg"
            width={274}
            height={350}
          />
        </div>

        {/* Banner indicators */}
        {banners.length > 1 && (
          <div className="flex justify-center space-x-2 -mt-2 mb-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentBannerIndex 
                    ? 'bg-blue' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoBanner;