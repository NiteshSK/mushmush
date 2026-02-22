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
    label: "✦ Premium Quality Mushrooms",
    title: "Nature's Finest.\nDelivered Fresh.",
    subtitle: "Rare superfoods & medicinal mushrooms sourced from the world's finest forests.",
    cta: "Shop Now",
    ctaHref: "/shop",
  },
  {
    image: "/images/hero/hero_mushrooms_1.png",
    label: "✦ Handcrafted Gift Baskets",
    title: "The Art of\nNourishment.",
    subtitle: "Curated mushroom baskets and superfood bundles for everyday vitality.",
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
                  className="object-cover object-left hero-image"
                  priority={index === 0}
                  sizes="100vw"
                  quality={100}
                  unoptimized
                />

                {/* Text overlay — left side of the image is clean so text reads clearly */}
                <div className="relative z-10 h-full flex items-center hero-slide-wrapper">
                  <div className="px-8 sm:px-14 xl:px-20 hero-text-col">
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#2a4026] mb-6">
                      {slide.label}
                    </p>
                    <h1 className="font-light text-[#1a1a1a] whitespace-pre-line leading-[1.1] mb-6 hero-headline">
                      {slide.title}
                    </h1>
                    <p className="text-[#2d3d28] text-sm sm:text-base leading-relaxed max-w-xs mb-10 font-light">
                      {slide.subtitle}
                    </p>
                    <div className="flex items-center gap-6">
                      <Link
                        href={slide.ctaHref}
                        className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white text-xs font-medium tracking-[0.15em] uppercase py-4 px-10 rounded-full hover:bg-[#3a5a2a] transition-all duration-500"
                      >
                        {slide.cta}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link
                        href="/about"
                        className="text-xs font-medium tracking-[0.15em] uppercase text-[#2d3d28] border-b border-[#2d3d28] pb-0.5 hover:text-[#1a2a16] hover:border-[#1a2a16] transition-all duration-300"
                      >
                        Our Story
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
          <button
            ref={setPrevEl}
            className="custom-prev w-9 h-9 flex items-center justify-center rounded-full border border-[#6a8a65] bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all text-[#1a1a1a] disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div ref={setPaginationEl} className="custom-pagination !static !w-auto !transform-none flex gap-2 items-center" />
          <button
            ref={setNextEl}
            className="custom-next w-9 h-9 flex items-center justify-center rounded-full border border-[#6a8a65] bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all text-[#1a1a1a] disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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