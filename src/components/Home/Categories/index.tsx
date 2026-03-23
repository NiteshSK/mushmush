"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Categories = () => {
  const { categories, loading, error } = useCategories();
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);

  return (
    <section className="overflow-hidden py-12 sm:py-16 relative bg-white">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        <div className="mb-10 text-center">
          <h2 className="font-medium text-2xl xl:text-heading-5 text-dark">
            Shop by Category
          </h2>
          <p className="text-gray-5 text-sm mt-2">Explore our curated selection</p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={5}
            spaceBetween={30}
            breakpoints={{
              0: { slidesPerView: 1.5, spaceBetween: 16 },
              540: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 30 },
              1280: { slidesPerView: 5, spaceBetween: 30 },
            }}
            className="categories-carousel pb-12"
            pagination={{
              clickable: true,
              el: paginationEl,
            }}
            navigation={{
              prevEl,
              nextEl,
            }}
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
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <SwiperSlide key={`skeleton-${index}`}>
                  <div className="flex flex-col items-center justify-center p-4 rounded-[10px] animate-pulse bg-white">
                    <div className="relative w-full aspect-square mb-4 bg-gray-100 rounded-[10px]"></div>
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                  </div>
                </SwiperSlide>
              ))
            ) : error ? (
              <div className="col-span-full text-center text-red-500 py-8">
                Error loading categories: {error}
              </div>
            ) : (
              categories.map((category) => (
                <SwiperSlide key={category.id}>
                  <Link href={category.path} className="group block h-full">
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-200 shadow-sm bg-white">
                      <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-gray-50">
                        <Image
                          src={category.img}
                          alt={category.title}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="font-medium text-center text-dark text-sm group-hover:text-forest transition-colors duration-300">
                        {category.title}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
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
      </div>
    </section>
  );
};

export default Categories;