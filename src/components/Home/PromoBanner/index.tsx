"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PromotionalBanner } from "@/types/promotional-banner";
import { usePromotionalBanners } from "@/hooks/usePromotionalBanners";

const PromoBanner = () => {
  const { banners, loading, currentBannerIndex, setCurrentBannerIndex } = usePromotionalBanners();

  console.log('🎯 PromoBanner Component State:');
  console.log('- Loading:', loading);
  console.log('- Banners length:', banners.length);
  console.log('- Current banner index:', currentBannerIndex);
  console.log('- Banners data:', banners);

  const generateBannerLink = (banner: PromotionalBanner): string => {
    if (banner.buttonLink) {
      return banner.buttonLink;
    }
    if (banner.product) {
      return `/shop-details/${banner.product.slug}`;
    }
    if (banner.category) {
      return `/shop?category=${banner.category.slug}`;
    }
    return '#';
  };

  if (loading) {
    // Skeleton loader remains the same, which is fine.
    return (
      <section className="overflow-hidden py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-12 text-center">
            <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gray-200 animate-pulse p-12 lg:p-16 mb-6">
            <div className="max-w-[600px] w-full">
              <div className="h-8 bg-gray-300 rounded mb-4 w-56"></div>
              <div className="h-12 bg-gray-400 rounded mb-6 w-80"></div>
              <div className="h-5 bg-gray-200 rounded mb-3 w-full"></div>
              <div className="h-5 bg-gray-200 rounded mb-8 w-4/5"></div>
              <div className="h-12 bg-gray-300 rounded w-40"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    // UPDATED: Section background color to match screenshot
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#E9E6F4] to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* Headline Section */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 text-gray-800">
            Special Festive Sale !
          </h2>
          <p className="text-gray-600 text-lg">Exclusive deals just for you</p>
        </div>

        {/* UPDATED & CATCHY: Promotional Banner */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl transform transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl mb-8 bg-gradient-to-br from-white to-gray-50 border border-gray-200">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 via-pink-100/20 to-purple-100/20 animate-gradient-x"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiNmZmQ3MDAiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0iI2ZmNzAwMCIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9IiNmZjAwZmYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSI0NSIgcj0iMSIgZmlsbD0iIzcwMDBmZiIgZmlsbC1vcGFjaXR5PSIwLjI1Ii8+PGNpcmNsZSBjeD0iNDUiIGN5PSI1MCIgcj0iMiIgZmlsbD0iI2ZmZmQ3MDAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          
          {/* Floating Celebration Elements */}
          <div className="absolute top-4 left-4 text-4xl animate-bounce">🎉</div>
          <div className="absolute top-4 right-4 text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>🎊</div>
          <div className="absolute bottom-4 left-4 text-3xl animate-pulse">✨</div>
          <div className="absolute bottom-4 right-4 text-3xl animate-pulse" style={{animationDelay: '0.3s'}}>🌟</div>
          <div className="absolute top-1/2 left-8 text-2xl animate-bounce" style={{animationDelay: '0.4s'}}>🎁</div>
          <div className="absolute top-1/2 right-8 text-2xl animate-bounce" style={{animationDelay: '0.6s'}}>🎈</div>
          
          {/* Additional Floating Elements */}
          <div className="absolute top-8 left-1/4 text-xl animate-float">🪔</div>
          <div className="absolute top-12 right-1/4 text-xl animate-float" style={{animationDelay: '0.8s'}}>🕉️</div>
          <div className="absolute bottom-8 left-1/3 text-lg animate-float" style={{animationDelay: '1s'}}>🌺</div>
          <div className="absolute bottom-12 right-1/3 text-lg animate-float" style={{animationDelay: '1.2s'}}>🔥</div>
          
          {/* Sparkle Effects */}
          <div className="absolute top-6 left-1/2 text-xs animate-sparkle">💫</div>
          <div className="absolute bottom-6 left-1/2 text-xs animate-sparkle" style={{animationDelay: '0.5s'}}>⭐</div>
          <div className="absolute top-1/3 left-6 text-xs animate-sparkle" style={{animationDelay: '0.7s'}}>✦</div>
          <div className="absolute top-1/3 right-6 text-xs animate-sparkle" style={{animationDelay: '0.9s'}}>✧</div>
          
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 animate-pulse pointer-events-none"></div>
          
          <div className="relative p-8 lg:p-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              {/* Left Column: Promotional Content */}
              <div className="mb-8 lg:mb-0">
                <div className="max-w-[600px] w-full">
                  {currentBanner.subtitle && (
                    // UPDATED: Subtitle colors to match new theme
                    <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-4 py-2 mb-4">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      <span className="text-violet-800 text-sm font-medium">
                        {currentBanner.subtitle}
                      </span>
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    </div>
                  )}

                  <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight font-bold text-gray-900">
                    {currentBanner.discount || currentBanner.title}
                  </h2>

                  {currentBanner.description && (
                    <p className="text-lg lg:text-xl mb-6 leading-relaxed text-gray-700">
                      {currentBanner.description}
                    </p>
                  )}

                  {/* UPDATED: CTA Button with new theme colors */}
                  <Link
                    href={generateBannerLink(currentBanner)}
                    className="inline-flex items-center gap-3 text-base text-black bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    <span>{currentBanner.buttonText}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="relative flex justify-center items-center">
                <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                  {/* UPDATED: Background circle with theme color */}
                  <div className="absolute inset-0 bg-[#E9E6F4] rounded-full transform scale-105 opacity-70"></div>
                  <div className="relative z-10 w-[80%] h-[80%]">
                    <img
                      // Make sure to replace this src with your actual banner image path
                      src={currentBanner.imageUrl || "/images/placeholder-mushroom.png"}
                      alt={currentBanner.title || "Special promotional offer"}
                      className="rounded-lg shadow-xl w-full h-full object-cover" // Changed to object-cover for better image fit
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Banner Pagination */}
        {banners.length > 1 && (
          <div className="flex flex-col items-center gap-0 -mt-0 mb-0">
            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentBannerIndex((prev) => prev === 0 ? banners.length - 1 : prev - 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Previous banner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Indicator Dots */}
              <div className="flex items-center gap-3">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentBannerIndex 
                        ? 'bg-black scale-125 shadow-lg' 
                        : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                    }`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentBannerIndex((prev) => prev === banners.length - 1 ? 0 : prev + 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Next banner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Banner Counter */}
            <div className="text-sm text-gray-600 font-medium">
              {currentBannerIndex + 1} of {banners.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Custom CSS for animations
const customStyles = `
  @keyframes gradient-x {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.8;
    }
    25% {
      transform: translateY(-10px) rotate(5deg);
      opacity: 1;
    }
    50% {
      transform: translateY(-5px) rotate(-3deg);
      opacity: 0.9;
    }
    75% {
      transform: translateY(-15px) rotate(2deg);
      opacity: 1;
    }
  }
  
  @keyframes sparkle {
    0%, 100% {
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 1;
    }
  }
  
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 8s ease infinite;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-sparkle {
    animation: sparkle 2s ease-in-out infinite;
  }
`;

export default PromoBanner;