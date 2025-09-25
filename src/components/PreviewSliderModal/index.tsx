"use client";
import React from "react";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import Image from "next/image";

export const PreviewSliderModal = () => {
  const { isModalPreviewOpen, previewProduct, closePreviewModal } = usePreviewSlider();

  // If the modal isn't open or there's no product, render nothing
  if (!isModalPreviewOpen || !previewProduct) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-11/12 max-w-2xl p-4 bg-white rounded-lg">
        {/* Close Button */}
        <button
          onClick={closePreviewModal}
          className="absolute top-2 right-2 z-10 p-2 text-2xl text-gray-800"
        >
          &times;
        </button>

        <h3 className="mb-4 text-xl font-bold">{previewProduct.title}</h3>

        {/* Image Slider */}
        <Swiper
          loop={true}
          spaceBetween={10}
          navigation={true}
          modules={[Navigation, Thumbs, FreeMode]}
          className="mySwiper2"
        >
          {previewProduct.imgs.previews.map((img, index) => (
            <SwiperSlide key={index}>
              <Image
                src={img}
                alt={`${previewProduct.title} preview ${index + 1}`}
                width={600}
                height={600}
                className="object-contain w-full h-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};