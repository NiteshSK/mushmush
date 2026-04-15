"use client";
import React, { useEffect, useMemo } from "react";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

export const PreviewSliderModal = () => {
  const { isModalPreviewOpen, previewProduct, closePreviewModal } = usePreviewSlider();

  // Combine all available images, deduplicated
  const allImages = useMemo(() => {
    if (!previewProduct?.imgs) return [];
    const previews = previewProduct.imgs.previews || [];
    const thumbnails = previewProduct.imgs.thumbnails || [];
    // Use previews first, then add any thumbnails not already in previews
    const combined = [...previews];
    for (const thumb of thumbnails) {
      if (!combined.includes(thumb)) {
        combined.push(thumb);
      }
    }
    return combined;
  }, [previewProduct]);

  // Lock body scroll and pointer events when modal is open
  useEffect(() => {
    if (isModalPreviewOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [isModalPreviewOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreviewModal();
    };
    if (isModalPreviewOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalPreviewOpen, closePreviewModal]);

  if (!isModalPreviewOpen || !previewProduct || allImages.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 pointer-events-auto"
      onClick={(e) => { e.stopPropagation(); closePreviewModal(); }}
      onTouchEnd={(e) => { e.stopPropagation(); }}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); closePreviewModal(); }}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Close preview"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Product title */}
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-white text-sm font-medium opacity-60">{previewProduct.title}</h3>
      </div>

      {/* Image slider container — stop click propagation so clicking image doesn't close */}
      <div
        className="relative w-full max-w-4xl mx-4 sm:mx-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Swiper
          loop={allImages.length > 1}
          spaceBetween={0}
          navigation={allImages.length > 1}
          modules={[Navigation]}
          className="preview-swiper"
        >
          {allImages.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-[75vh] sm:h-[80vh] w-full">
                <Image
                  src={img}
                  alt={`${previewProduct.title} - Image ${index + 1}`}
                  fill
                  className="object-contain select-none"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority={index === 0}
                  draggable={false}
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/15 text-white text-xs font-medium px-3.5 py-1.5 rounded-full">
            {allImages.length} images — swipe to browse
          </div>
        )}
      </div>

      {/* Custom swiper nav styles — dark buttons visible on any background */}
      <style jsx global>{`
        .preview-swiper .swiper-button-prev,
        .preview-swiper .swiper-button-next {
          width: 44px;
          height: 44px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          transition: background 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .preview-swiper .swiper-button-prev:hover,
        .preview-swiper .swiper-button-next:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        .preview-swiper .swiper-button-prev::after,
        .preview-swiper .swiper-button-next::after {
          font-size: 16px;
          font-weight: bold;
          color: white;
        }
        .preview-swiper .swiper-button-disabled {
          opacity: 0.2 !important;
        }
      `}</style>
    </div>
  );
};
