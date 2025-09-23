"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PromotionalBanner } from "@/types/promotional-banner";
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
      <section className="overflow-hidden py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-12 h-16 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
          <div className="relative h-[400px] rounded-2xl bg-gray-200 animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    // Section now includes relative positioning for full-section effects
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#E9E6F4] to-white overflow-hidden">
      {/* Full section festive background elements - z-index below content */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Confetti sprinkle effect across the whole section (can be adjusted for Navratri theme if needed) */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`section-sparkle-dots-${i}`} // Renamed key to avoid clash and distinguish
            className="absolute w-2 h-2 rounded-full bg-red-400 animate-section-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              backgroundColor: ['#f87171', '#fbbf24', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 4)],
            }}
          />
        ))}
        {/* Soft pulse overlay for the entire section */}
        <div className="absolute inset-0 bg-purple-200/10 animate-pulse-soft"></div>

        {/* NEW: Om and Diya Symbols scattered across the section */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`om-diya-${i}`}
            className="absolute text-3xl animate-float-gentle opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
              color: ['#ff8c00', '#ffd700', '#ff6347', '#ffdab9'][Math.floor(Math.random() * 4)], // Warm festive colors
            }}
          >
            {i % 2 === 0 ? '🕉️' : '🪔'} {/* Om or Diya */}
          </div>
        ))}

        {/* NEW: Firecracker Explosion Animation in the section background */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`firecracker-${i}`}
            className="absolute w-1 h-1 bg-transparent animate-firecracker"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`, // Random delay for staggered explosions
              animationDuration: `1.5s`, // Quick explosion
              transform: `scale(0)`, // Start small
            }}
          ></div>
        ))}

        {/* MOVED: Confetti Rain for the entire section (outside the banner) */}
        {[...Array(30)].map((_, i) => ( // Increased count for more visible confetti outside
          <div
            key={`section-confetti-fall-${i}`}
            className="absolute w-2 h-6 animate-confetti-fall z-0" // Ensure z-0 to stay behind banner
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`, // Start above the section
              animationDelay: `${Math.random() * 6}s`, // Longer delay for section-wide fall
              animationDuration: `${8 + Math.random() * 6}s`, // Longer duration for full section fall
              backgroundColor: ['#ff6b6b', '#ffa500', '#32cd32', '#1e90ff', '#9370db', '#ff69b4'][Math.floor(Math.random() * 6)],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}

      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10"> {/* Ensure content is above section effects */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 text-gray-800">
            Special Festive Sale!
          </h2>
          <p className="text-gray-600 text-lg">Exclusive deals just for you</p>
        </div>

        {/* Festive Promotional Banner */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl mb-8 border-2 animate-rainbow-border-fancy">
          {/* Animated effects *inside* the banner - ensure these are z-index higher than content bg */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Glitter Sparkles - more visible */}
            {[...Array(50)].map((_, i) => (
              <div
                key={`banner-glitter-${i}`}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-glitter-sparkle-strong"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  opacity: 0.8 + Math.random() * 0.2, // Make them a bit brighter
                }}
              />
            ))}
            {/* REMOVED: Confetti Rain from inside the banner */}
            
            {/* Corner Emojis - more prominent */}
            <div className="absolute top-4 left-4 text-6xl animate-bounce-super drop-shadow-lg text-red-500">🎉</div>
            <div className="absolute top-4 right-4 text-6xl animate-bounce-super drop-shadow-lg text-yellow-500" style={{ animationDelay: '0.3s' }}>🎊</div>
            <div className="absolute bottom-4 left-4 text-5xl animate-pulse-super drop-shadow-lg text-green-500" style={{ animationDelay: '0.6s' }}>✨</div>
            <div className="absolute bottom-4 right-4 text-5xl animate-pulse-super drop-shadow-lg text-blue-500" style={{ animationDelay: '0.9s' }}>🌟</div>
          </div>
          
          {/* Main Content Area - z-index higher than fixed bg, lower than animations */}
          <div className="relative p-8 lg:p-12 z-10 bg-white rounded-2xl"> {/* Added rounded-2xl to match parent */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              {/* Left Column: Promotional Content */}
              <div className="mb-8 lg:mb-0 text-center lg:text-left">
                {currentBanner.subtitle && (
                  <div className="inline-block bg-gradient-to-r from-red-100 to-yellow-100 border border-yellow-300 rounded-full px-4 py-2 mb-4 animate-scale-pulse">
                    <span className="text-red-700 text-sm font-medium animate-text-glow">
                      {currentBanner.subtitle}
                    </span>
                  </div>
                )}

                <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight font-bold text-gray-900 animate-text-breathe">
                  {currentBanner.discount || currentBanner.title}
                </h2>

                {currentBanner.description && (
                  <p className="text-lg lg:text-xl mb-6 leading-relaxed text-gray-700">
                    {currentBanner.description}
                  </p>
                )}

                <Link
                  href={generateBannerLink(currentBanner)}
                  className="inline-flex items-center gap-3 text-base text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 font-semibold animate-button-pop"
                >
                  <span>{currentBanner.buttonText}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Right Column: Image */}
              <div className="relative flex justify-center items-center">
                <div className="relative w-full max-w-md aspect-square">
                  {/* Image background is now more festive */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-yellow-100 rounded-full transform scale-105 animate-spin-slow-fade"></div>
                  <div className="relative z-10 w-full h-full p-4">
                    <img
                      src={currentBanner.imageUrl || "/images/placeholder-mushroom.png"}
                      alt={currentBanner.title || "Special promotional offer"}
                      className="rounded-lg shadow-xl w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Banner Pagination */}
        {banners.length > 1 && (
          <div className="flex flex-col items-center gap-2 mt-4"> {/* Added margin-top for spacing */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                aria-label="Previous banner"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="text-sm text-gray-600 font-medium">
                {currentBannerIndex + 1} of {banners.length}
              </div>

              <button
                onClick={() => setCurrentBannerIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                aria-label="Next banner"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoBanner;