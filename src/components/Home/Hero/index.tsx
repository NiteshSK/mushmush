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
// Add new slides here. Each slide needs an `image` (path relative to /public).
// The first slide `image` is used as the default for all slides without one.
const slides = [
  {
    image: "/images/hero/hero_mushrooms.png",
    label: "✦ Premium Natural Products",
    title: "Nature's\nFinest.\nDelivered\nFresh.",
    subtitle: "Premium mushrooms, dry fruits, seeds & spices — sourced from the finest origins.",
    cta: "Shop Now",
    ctaHref: "/shop",
  },
  {
    image: "/images/hero/hero_mushrooms_1.png",
    label: "✦ Handcrafted Gift Baskets",
    title: "The Art\nof\nNourishment.",
    subtitle: "Curated gift baskets and superfood bundles for everyday vitality.",
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
              {/*
                TRUE single-image hero:
                - hero_mushrooms.png is 1376×768 landscape (user-provided, natural composition)
                - Left area of image is clean sage-green (for text readability)
                - Right area has the mushrooms
                - object-cover scales the image to fill the hero
                - object-left anchors image from the left edge so mushrooms on the right stay visible
                - Text is overlaid on top of the left empty area
              */}
              <div className="relative w-full overflow-hidden hero-slide-wrapper">

                {/* Single full-width image */}
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

                {/* Subtle left-side gradient for text readability — no full overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/10 to-transparent z-[1]" />

                {/* Text overlay — left side of the image is clean so text reads clearly */}
                <div className="relative z-10 h-full w-full flex items-center hero-slide-wrapper">
                  <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
                    <div className="hero-text-col max-w-[90vw] sm:max-w-md lg:max-w-lg">
                      <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-forest mb-4 sm:mb-6">
                        {slide.label}
                      </p>
                      <h1 className="font-medium text-dark whitespace-pre-line leading-[1.1] mb-4 sm:mb-6 hero-headline">
                        {slide.title}
                      </h1>
                      <p className="text-forest text-sm sm:text-base leading-relaxed max-w-xs mb-6 sm:mb-10 font-light">
                        {slide.subtitle}
                      </p>
                      <div className="flex items-center gap-3 sm:gap-6">
                        <Link
                          href={slide.ctaHref}
                          className="inline-flex items-center gap-2 bg-forest text-white text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase py-3 sm:py-4 px-6 sm:px-10 rounded-full hover:bg-dark transition-all duration-500"
                        >
                          {slide.cta}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <Link
                          href="/about"
                          className="text-xs font-medium tracking-[0.15em] uppercase text-forest border-b border-forest pb-0.5 hover:text-forest hover:border-forest transition-all duration-300"
                        >
                          Our Story
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mt-8 pb-4">
          <button
            ref={setPrevEl}
            className="custom-prev w-8 h-8 flex items-center justify-center rounded-full border border-transparent hover:border-dark hover:bg-transparent transition-all text-dark hover:text-black disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div ref={setPaginationEl} className="custom-pagination !static !w-auto !transform-none flex gap-2 items-center" />
          <button
            ref={setNextEl}
            className="custom-next w-8 h-8 flex items-center justify-center rounded-full border border-transparent hover:border-dark hover:bg-transparent transition-all text-dark hover:text-black disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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