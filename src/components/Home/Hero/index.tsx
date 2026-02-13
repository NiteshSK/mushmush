"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import HeroFeature from "./HeroFeature";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Hero = () => {
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);

  const slides = [
    {
      title: "Fresh.\nOrganic.\nDelivered.",
      image: "/images/categories/hero_mushrooms_2.png",
      bgColor: "bg-[#F0EFED]",
    },
    {
      title: "Premium\nMushrooms\nDelivered.",
      image: "/images/categories/hero_mushrooms_3.png",
      bgColor: "bg-[#E8F5F0]",
    },
    {
      title: "Natural.\nHealthy.\nFresh.",
      image: "/images/categories/hero_mushrooms_4.png",
      bgColor: "bg-[#F0E8F5]",
    },
  ];

  return (
    <>
      <section className="mt-32 relative mb-24" style={{ marginTop: '200px' }}>
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: paginationEl,
          }}
          navigation={{
            prevEl,
            nextEl,
          }}
          modules={[Autoplay, Pagination, Navigation]}
          className="hero-carousel"
          onBeforeInit={(swiper) => {
            if (typeof swiper.params.navigation !== 'boolean') {
              swiper.params.navigation!.prevEl = prevEl;
              swiper.params.navigation!.nextEl = nextEl;
            }
            if (typeof swiper.params.pagination !== 'boolean') {
              swiper.params.pagination!.el = paginationEl;
            }
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative ${slide.bgColor} overflow-hidden rounded-3xl mx-4 sm:mx-8 xl:mx-0`}>
                <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-12 xl:px-12">
                  <div className="flex flex-col lg:flex-row items-center min-h-[500px] lg:min-h-[600px] py-12 lg:py-0">
                    {/* Left Content */}
                    <div className="lg:w-1/2 z-10">
                      {/* Star Rating */}

                      {/* Heading */}
                      <h1 className="text-2xl lg:text-3xl xl:text-4xl font-normal text-dark mb-6 leading-tight whitespace-pre-line">
                        {slide.title}
                      </h1>

                      {/* CTA Button */}
                      <Link
                        href="/shop"
                        className="inline-block bg-dark text-white font-medium text-xs uppercase tracking-widest py-3 px-8 rounded-full hover:opacity-90 transition-all duration-300 shadow-sm"
                      >
                        Shop Now
                      </Link>
                    </div>

                    {/* Right Image with Geometric Shape */}
                    <div className="lg:w-1/2 relative flex items-center justify-center mt-8 lg:mt-0">
                      {/* Green Geometric Shape */}
                      <div className="absolute inset-0 flex items-center justify-end">
                        <div
                          className="w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] rounded-full"
                          style={{
                            background: "linear-gradient(135deg)",
                            clipPath: "polygon(0 0, 100% 0, 100% 100%, 40% 100%)",
                            transform: "translateX(20%)",
                          }}
                        />
                      </div>

                      {/* Product Image */}
                      <div className="relative z-10">
                        <Image
                          src={slide.image}
                          alt="Fresh Organic Products"
                          width={600}
                          height={600}
                          className="object-contain drop-shadow-2xl"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Controls */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button ref={setPrevEl} className="custom-prev w-10 h-10 flex items-center justify-center rounded-full border border-transparent hover:border-[#222] hover:bg-transparent transition-all text-[#222] hover:text-black disabled:opacity-30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div ref={setPaginationEl} className="custom-pagination !static !w-auto !transform-none flex gap-2 items-center"></div>

          <button ref={setNextEl} className="custom-next w-10 h-10 flex items-center justify-center rounded-full border border-transparent hover:border-[#222] hover:bg-transparent transition-all text-[#222] hover:text-black disabled:opacity-30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <HeroFeature />
    </>
  );
};

export default Hero;