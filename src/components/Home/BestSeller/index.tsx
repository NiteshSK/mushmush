"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import SingleItem from "./SingleItem";
import NotifyMeModal from "../../NotifyMeModal";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import { usePromotionalBanners } from "@/hooks/usePromotionalBanners";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const BestSeller = () => {
  const { products, loading } = useProducts();
  const { hasBanners } = usePromotionalBanners();

  // Same ref-based nav pattern as Categories
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);

  const bestSellers = products
    .sort((a: Product, b: Product) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .sort((a: Product, b: Product) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return 0;
    })
    .slice(0, 8);

  // NotifyMe modal state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleNotifyMe = (product: Product) => {
    setSelectedProduct(product);
    setNotifyModalOpen(true);
  };

  const handleCloseNotifyModal = () => {
    setNotifyModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section className={`pt-6 pb-14 ${hasBanners ? "pt-20" : ""}`}>
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">

        {/* ── Section header ── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[13px] text-[#1a1a1a] underline underline-offset-2 hover:text-gray-500 transition-colors"
          >
            View all products
          </Link>
        </div>

        {/* ── Product carousel ── */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-[220px] bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-9 bg-gray-200 rounded-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true, el: paginationEl }}
              navigation={{ prevEl, nextEl }}
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="best-seller-carousel pb-12"
              style={{ alignItems: "stretch" }}
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
              {bestSellers.map((item) => (
                <SwiperSlide key={item.id} style={{ height: "auto" }}>
                  <SingleItem item={item} onNotifyMe={handleNotifyMe} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : null}
        </div>

        {/* ── Navigation Controls — identical to Categories ── */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            ref={setPrevEl}
            className="custom-prev w-10 h-10 flex items-center justify-center rounded-full border border-transparent hover:border-[#222] hover:bg-transparent transition-all text-[#222] hover:text-black disabled:opacity-30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div ref={setPaginationEl} className="custom-pagination !static !w-auto !transform-none flex gap-2 items-center" />

          <button
            ref={setNextEl}
            className="custom-next w-10 h-10 flex items-center justify-center rounded-full border border-transparent hover:border-[#222] hover:bg-transparent transition-all text-[#222] hover:text-black disabled:opacity-30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* NotifyMe Modal */}
      {selectedProduct && (
        <NotifyMeModal
          isOpen={notifyModalOpen}
          onClose={handleCloseNotifyModal}
          productId={selectedProduct.id}
          productTitle={selectedProduct.title}
        />
      )}
    </section>
  );
};

export default BestSeller;