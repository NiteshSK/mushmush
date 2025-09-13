"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PromotionalBanner } from "@/types/promotional-banner";

const PromoBanner = () => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/promotional-banners?limit=5');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setBanners(data.data);
        }
      } catch (error) {
        console.error('Error fetching promotional banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners every 5 seconds if multiple banners exist
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

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
      <section className="overflow-hidden pt-20 pb-4">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
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
    <section className="overflow-hidden pt-20 pb-4">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
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