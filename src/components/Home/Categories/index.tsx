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
    <section className="overflow-hidden py-8 pb-6 relative">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        <div className="mb-10">
          <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_834_7356)">
                <path
                  d="M3.94024 13.4474C2.6523 12.1595 2.00832 11.5155 1.7687 10.68C1.52908 9.84449 1.73387 8.9571 2.14343 7.18231L2.37962 6.15883C2.72419 4.66569 2.89648 3.91912 3.40771 3.40789C3.91894 2.89666 4.66551 2.72437 6.15865 2.3798L7.18213 2.14361C8.95692 1.73405 9.84431 1.52927 10.6798 1.76889C11.5153 2.00851 12.1593 2.65248 13.4472 3.94042L14.9719 5.46512C17.2128 7.70594 18.3332 8.82635 18.3332 10.2186C18.3332 11.6109 17.2128 12.7313 14.9719 14.9721C12.7311 17.2129 11.6107 18.3334 10.2184 18.3334C8.82617 18.3334 7.70576 17.2129 5.46494 14.9721L3.94024 13.4474Z"
                  stroke="#3C50E0"
                  strokeWidth="1.5"
                />
                <circle
                  cx="7.17245"
                  cy="7.39917"
                  r="1.66667"
                  transform="rotate(-45 7.17245 7.39917)"
                  stroke="#3C50E0"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.61837 15.4164L15.4342 9.6004"
                  stroke="#3C50E0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_834_7356">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Categories
          </span>
          <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
            Shop by Category
          </h2>
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
                  <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg h-[320px] animate-pulse bg-gray-50">
                    <div className="relative w-48 h-48 mb-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
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
                    <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl h-[320px] bg-white group-hover:shadow-lg group-hover:border-blue-300 transition-all duration-300">
                      <div className="relative w-48 h-48 mb-6">
                        <Image
                          src={category.img}
                          alt={category.title}
                          fill
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-normal text-center text-dark text-lg group-hover:text-blue transition-colors duration-300 leading-tight">
                        {category.title}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>

        {/* Custom Navigation Controls (Matching Hero Style) */}
        <div className="flex items-center justify-center gap-4 mt-8">
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
      </div>
    </section>
  );
};

export default Categories;