"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import { Testimonial } from "@/types/testimonial";

import { Autoplay } from "swiper/modules";
import "swiper/css";
import SingleItem from "./SingleItem";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.testimonials || []);
        }
      } catch {
        setTestimonials([]);
      } finally {
        setLoaded(true);
      }
    };

    fetchTestimonials();
  }, []);

  if (!loaded || testimonials.length === 0) {
    return null;
  }

  // For a smooth continuous loop, Swiper needs at least slidesPerView * 2 slides.
  // If we have fewer testimonials, duplicate the array so the marquee can scroll seamlessly.
  const minForLoop = 6;
  const slides =
    testimonials.length < minForLoop
      ? Array.from({ length: Math.ceil(minForLoop / testimonials.length) }, () => testimonials).flat()
      : testimonials;

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
          modules={[Autoplay]}
          slidesPerView={3}
          spaceBetween={20}
          loop={true}
          speed={6000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          allowTouchMove={true}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          className="testimonials-marquee"
        >
          {slides.map((item, key) => (
            <SwiperSlide key={`${item.id ?? "t"}-${key}`}>
              <SingleItem testimonial={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .testimonials-marquee .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
