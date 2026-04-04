"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState, useEffect } from "react";
import { Testimonial } from "@/types/testimonial";
import testimonialsData from "./testimonialsData";

import { Pagination, Navigation } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";
import SingleItem from "./SingleItem";

const Testimonials = () => {
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          if (data.testimonials && data.testimonials.length > 0) {
            setTestimonials(data.testimonials);
          } else {
            // Fall back to hardcoded data if no DB reviews yet
            setTestimonials(testimonialsData);
          }
        } else {
          setTestimonials(testimonialsData);
        }
      } catch {
        setTestimonials(testimonialsData);
      } finally {
        setLoaded(true);
      }
    };

    fetchTestimonials();
  }, []);

  // Don't render the section at all if no testimonials
  if (loaded && testimonials.length === 0) {
    return null;
  }

  // Don't render until loaded to avoid layout shift
  if (!loaded) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-cream">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-blue mb-2">
            Testimonials
          </span>
          <h2 className="font-medium text-2xl xl:text-heading-5 text-dark">
            What Our Customers Say
          </h2>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={3}
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          pagination={{
            clickable: true,
            el: paginationEl,
          }}
          navigation={{
            prevEl,
            nextEl,
          }}
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
          {testimonials.map((item, key) => (
            <SwiperSlide key={item.id ?? key}>
              <SingleItem testimonial={item} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            ref={setPrevEl}
            className="custom-prev w-8 h-8 flex items-center justify-center rounded-full border border-transparent hover:border-dark hover:bg-transparent transition-all text-dark hover:text-black disabled:opacity-30"
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
            className="custom-next w-8 h-8 flex items-center justify-center rounded-full border border-transparent hover:border-dark hover:bg-transparent transition-all text-dark hover:text-black disabled:opacity-30"
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
      </div>
    </section>
  );
};

export default Testimonials;
