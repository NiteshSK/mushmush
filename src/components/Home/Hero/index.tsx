"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import HeroFeature from "./HeroFeature";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// ─── Hero Slides Config ────────────────────────────────────────────────────
const slides = [
  {
    image: "/images/hero/hero_mushrooms.png",
    label: "Premium Natural Products",
    title: "Nature's\nFinest.\nDelivered\nFresh.",
    subtitle:
      "Premium mushrooms, dry fruits, seeds & spices — sourced from the finest origins.",
    cta: "Shop Now",
    ctaHref: "/shop",
  },
  {
    image: "/images/hero/hero_mushrooms_1.png",
    label: "Handcrafted Gift Baskets",
    title: "The Art\nof\nNourishment.",
    subtitle:
      "Curated gift baskets and superfood bundles for everyday vitality.",
    cta: "Explore Gifts",
    ctaHref: "/shop",
  },
];

const Hero = () => {
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <section className="hero-section relative" style={{ marginTop: "80px" }}>
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true, el: paginationEl }}
          navigation={{ prevEl, nextEl }}
          modules={[Autoplay, Pagination, Navigation]}
          className="hero-carousel w-full"
          onBeforeInit={(swiper) => {
            if (typeof swiper.params.navigation !== "boolean") {
              swiper.params.navigation!.prevEl = prevEl;
              swiper.params.navigation!.nextEl = nextEl;
            }
            if (typeof swiper.params.pagination !== "boolean") {
              swiper.params.pagination!.el = paginationEl;
            }
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              {/* ── MOBILE: Stacked layout (text on bg, then image) ── */}
              <div className="block md:hidden">
                {/* Text block with solid background */}
                <div className="bg-[#f5f3ef] px-5 pt-8 pb-6">
                  <div className="max-w-md mx-auto">
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-forest mb-3 flex items-center gap-1.5">
                      <span className="w-4 h-px bg-forest inline-block" />
                      {slide.label}
                    </p>
                    <h1 className="font-medium text-dark whitespace-pre-line leading-[1.1] mb-3 hero-headline">
                      {slide.title}
                    </h1>
                    <p className="text-dark-5 text-sm leading-relaxed max-w-xs mb-5 font-light">
                      {slide.subtitle}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        href={slide.ctaHref}
                        className="inline-flex items-center gap-2 bg-forest text-white text-[10px] font-medium tracking-[0.15em] uppercase py-3 px-6 rounded-full hover:bg-dark transition-all duration-500"
                      >
                        {slide.cta}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link
                        href="/about"
                        className="text-[10px] font-medium tracking-[0.15em] uppercase text-forest border-b border-forest pb-0.5 hover:text-dark hover:border-dark transition-all duration-300"
                      >
                        Our Story
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Image block */}
                <div className="relative w-full aspect-[4/3] bg-[#f5f3ef]">
                  <Image
                    src={slide.image}
                    alt={slide.label}
                    fill
                    className="object-cover object-center"
                    priority={index === 0}
                    sizes="100vw"
                    quality={90}
                  />
                </div>
              </div>

              {/* ── DESKTOP / TABLET: Overlay layout ── */}
              <div className="hidden md:block">
                <div className="relative w-full overflow-hidden hero-slide-wrapper">
                  {/* Full-width background image */}
                  <Image
                    src={slide.image}
                    alt={slide.label}
                    fill
                    className="object-cover object-right hero-image"
                    priority={index === 0}
                    sizes="100vw"
                    quality={100}
                    unoptimized
                  />

                  {/* Text overlay */}
                  <div className="relative z-10 h-full w-full flex items-center hero-slide-wrapper">
                    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
                      <div className="hero-text-col">
                        <p className="text-xs font-medium tracking-[0.2em] uppercase text-forest mb-6 flex items-center gap-2">
                          <span className="w-6 h-px bg-forest inline-block" />
                          {slide.label}
                        </p>
                        <h1 className="font-medium text-dark whitespace-pre-line leading-[1.1] mb-6 hero-headline">
                          {slide.title}
                        </h1>
                        <p className="text-forest text-base leading-relaxed max-w-xs mb-10 font-light">
                          {slide.subtitle}
                        </p>
                        <div className="flex items-center gap-6">
                          <Link
                            href={slide.ctaHref}
                            className="inline-flex items-center gap-2 bg-forest text-white text-xs font-medium tracking-[0.15em] uppercase py-4 px-10 rounded-full hover:bg-dark transition-all duration-500"
                          >
                            {slide.cta}
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <Link
                            href="/about"
                            className="text-xs font-medium tracking-[0.15em] uppercase text-forest border-b border-forest pb-0.5 hover:text-dark hover:border-dark transition-all duration-300"
                          >
                            Our Story
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8 pb-4">
          <button
            ref={setPrevEl}
            className="custom-prev w-10 h-10 flex items-center justify-center rounded-full border border-gray-3 hover:border-dark transition-all text-dark-5 hover:text-dark disabled:opacity-30"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div
            ref={setPaginationEl}
            className="custom-pagination !static !w-auto !transform-none flex gap-2 items-center"
          />
          <button
            ref={setNextEl}
            className="custom-next w-10 h-10 flex items-center justify-center rounded-full border border-gray-3 hover:border-dark transition-all text-dark-5 hover:text-dark disabled:opacity-30"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      <HeroFeature />
    </>
  );
};

export default Hero;
