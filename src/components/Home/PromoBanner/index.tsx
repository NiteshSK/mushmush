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
        <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-[1.03] hover:shadow-3xl mb-8 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 border-4 border-yellow-400">
          {/* Bright Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-yellow-400/20 via-green-400/20 via-blue-400/20 via-purple-400/20 to-pink-400/20 animate-rainbow-flow"></div>
          
          {/* Large Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-particle-float shadow-lg"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${4 + Math.random() * 3}s`,
                  boxShadow: '0 0 10px rgba(255, 255, 0, 0.8)',
                }}
              />
            ))}
          </div>
          
          {/* Giant Corner Celebrations */}
          <div className="absolute top-2 left-2 text-6xl animate-bounce-super text-yellow-500 drop-shadow-lg">🎉</div>
          <div className="absolute top-2 right-2 text-6xl animate-bounce-super text-pink-500 drop-shadow-lg" style={{animationDelay: '0.3s'}}>🎊</div>
          <div className="absolute bottom-2 left-2 text-5xl animate-pulse-super text-purple-500 drop-shadow-lg">✨</div>
          <div className="absolute bottom-2 right-2 text-5xl animate-pulse-super text-blue-500 drop-shadow-lg" style={{animationDelay: '0.5s'}}>🌟</div>
          
          {/* Large Side Elements */}
          <div className="absolute top-1/4 left-8 text-4xl animate-float-3d text-orange-500 drop-shadow-lg">�</div>
          <div className="absolute top-1/4 right-8 text-4xl animate-float-3d text-red-500 drop-shadow-lg" style={{animationDelay: '0.7s'}}>�</div>
          <div className="absolute bottom-1/4 left-8 text-3xl animate-float-3d text-green-500 drop-shadow-lg" style={{animationDelay: '0.9s'}}>🪔</div>
          <div className="absolute bottom-1/4 right-8 text-3xl animate-float-3d text-indigo-500 drop-shadow-lg" style={{animationDelay: '1.1s'}}>🕉️</div>
          
          {/* Giant Sparkles */}
          <div className="absolute top-1/2 left-1/4 text-3xl animate-sparkle-explosive text-yellow-400 drop-shadow-lg">💫</div>
          <div className="absolute top-1/2 right-1/4 text-3xl animate-sparkle-explosive text-pink-400 drop-shadow-lg" style={{animationDelay: '0.4s'}}>⭐</div>
          <div className="absolute top-1/3 left-1/2 text-2xl animate-sparkle-explosive text-purple-400 drop-shadow-lg" style={{animationDelay: '0.8s'}}>✦</div>
          <div className="absolute bottom-1/3 left-1/2 text-2xl animate-sparkle-explosive text-blue-400 drop-shadow-lg" style={{animationDelay: '1.2s'}}>✧</div>
          
          {/* Bright Flashing Lights */}
          <div className="absolute top-8 left-1/3 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-8 right-1/3 w-4 h-4 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-8 left-1/3 w-4 h-4 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-8 right-1/3 w-4 h-4 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
          
          {/* Shooting Stars */}
          <div className="absolute top-4 right-4 w-24 h-2 bg-gradient-to-l from-yellow-400 to-transparent animate-shooting-star shadow-lg"></div>
          <div className="absolute bottom-4 left-4 w-24 h-2 bg-gradient-to-r from-pink-400 to-transparent animate-shooting-star-reverse shadow-lg" style={{animationDelay: '2s'}}></div>
          
          {/* Giant Glowing Border */}
          <div className="absolute inset-0 rounded-2xl border-8 border-yellow-400 animate-border-glow pointer-events-none shadow-2xl"></div>
          
          {/* Bright Overlay Pulse */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 via-pink-300/30 to-purple-300/30 animate-pulse-fast pointer-events-none"></div>
          
          <div className="relative p-8 lg:p-12 z-20 bg-white/90 backdrop-blur-sm rounded-xl">
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
  
  /* NEW ENHANCED ANIMATIONS */
  
  @keyframes rainbow-flow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes particle-float {
    0% {
      transform: translateY(100vh) translateX(0) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) translateX(50px) scale(1);
      opacity: 0;
    }
  }
  
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }
  
  @keyframes border-rainbow {
    0% {
      border-color: #ff6b6b;
      box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    }
    16.66% {
      border-color: #ffa500;
      box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
    }
    33.33% {
      border-color: #32cd32;
      box-shadow: 0 0 20px rgba(50, 205, 50, 0.5);
    }
    50% {
      border-color: #1e90ff;
      box-shadow: 0 0 20px rgba(30, 144, 255, 0.5);
    }
    66.66% {
      border-color: #9370db;
      box-shadow: 0 0 20px rgba(147, 112, 219, 0.5);
    }
    83.33% {
      border-color: #ff69b4;
      box-shadow: 0 0 20px rgba(255, 105, 180, 0.5);
    }
    100% {
      border-color: #ff6b6b;
      box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    }
  }
  
  @keyframes bounce-super {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0) scale(1);
    }
    40% {
      transform: translateY(-30px) scale(1.1);
    }
    60% {
      transform: translateY(-15px) scale(1.05);
    }
  }
  
  @keyframes pulse-super {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.3);
      opacity: 1;
    }
  }
  
  @keyframes float-3d {
    0%, 100% {
      transform: translateY(0px) translateX(0px) rotateY(0deg) rotateZ(0deg);
      opacity: 0.7;
    }
    25% {
      transform: translateY(-20px) translateX(10px) rotateY(180deg) rotateZ(5deg);
      opacity: 1;
    }
    50% {
      transform: translateY(-10px) translateX(-10px) rotateY(360deg) rotateZ(-3deg);
      opacity: 0.9;
    }
    75% {
      transform: translateY(-25px) translateX(5px) rotateY(540deg) rotateZ(2deg);
      opacity: 1;
    }
  }
  
  @keyframes spin-slow {
    0% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(180deg) scale(1.2);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }
  
  @keyframes spin-slow-reverse {
    0% {
      transform: rotate(360deg) scale(1);
    }
    50% {
      transform: rotate(180deg) scale(1.2);
    }
    100% {
      transform: rotate(0deg) scale(1);
    }
  }
  
  @keyframes sparkle-explosive {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    20% {
      transform: scale(0.5) rotate(90deg);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.5) rotate(180deg);
      opacity: 1;
    }
    80% {
      transform: scale(1) rotate(270deg);
      opacity: 0.7;
    }
    100% {
      transform: scale(0) rotate(360deg);
      opacity: 0;
    }
  }
  
  @keyframes shooting-star {
    0% {
      transform: translateX(-100px) translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateX(100px) translateY(-50px);
      opacity: 0;
    }
  }
  
  @keyframes shooting-star-reverse {
    0% {
      transform: translateX(100px) translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateX(-100px) translateY(-50px);
      opacity: 0;
    }
  }
  
  @keyframes pulse-fast {
    0%, 100% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.3;
    }
  }
  
  /* Animation Classes */
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
  
  .animate-rainbow-flow {
    background-size: 300% 300%;
    animation: rainbow-flow 6s ease infinite;
  }
  
  .animate-particle-float {
    animation: particle-float 7s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
  
  .animate-border-rainbow {
    animation: border-rainbow 4s linear infinite;
  }
  
  .animate-bounce-super {
    animation: bounce-super 2s ease-in-out infinite;
  }
  
  .animate-pulse-super {
    animation: pulse-super 1.5s ease-in-out infinite;
  }
  
  .animate-float-3d {
    animation: float-3d 8s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 4s linear infinite;
  }
  
  .animate-spin-slow-reverse {
    animation: spin-slow-reverse 4s linear infinite;
  }
  
  .animate-sparkle-explosive {
    animation: sparkle-explosive 2.5s ease-in-out infinite;
  }
  
  .animate-shooting-star {
    animation: shooting-star 3s ease-in-out infinite;
  }
  
  .animate-shooting-star-reverse {
    animation: shooting-star-reverse 3s ease-in-out infinite;
  }
  
  .animate-pulse-fast {
    animation: pulse-fast 1s ease-in-out infinite;
  }
`;

export default PromoBanner;