"use client";
import React, { useEffect, useState } from "react";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const product = useAppSelector((state) => state.quickViewReducer.value);
  const [activePreview, setActivePreview] = useState(0);

  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(product));
    openPreviewModal({
      title: product.title,
      imgs: {
        previews: product.imgs?.previews || []
      },
    });
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart({ ...product, quantity }));
    closeModal();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeModal();
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
      setActivePreview(0);
    };
  }, [isModalOpen, closeModal]);

  if (!product?.id) {
    return null;
  }

  return (
    <div
      className={`${
        isModalOpen ? "z-99999" : "hidden"
      } fixed inset-0 overflow-y-auto no-scrollbar bg-black/40 flex items-center justify-center p-4 sm:p-8`}
    >
      <div className="w-full max-w-[960px] rounded-2xl bg-white p-6 sm:p-8 relative modal-content">
        {/* Close */}
        <button
          onClick={closeModal}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-dark z-20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Images */}
          <div className="lg:w-1/2">
            <div className="flex gap-3">
              {/* Thumbnails */}
              <div className="flex flex-col gap-2">
                {product.imgs.thumbnails?.map((img: string, key: number) => (
                  <button
                    onClick={() => setActivePreview(key)}
                    key={key}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-cream flex items-center justify-center transition-all ${
                      activePreview === key ? "ring-2 ring-forest" : "hover:ring-1 hover:ring-gray-300"
                    }`}
                  >
                    <Image
                      src={img || "/images/placeholder.png"}
                      alt="thumbnail"
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1 relative rounded-xl bg-cream flex items-center justify-center min-h-[240px] sm:min-h-[360px] overflow-hidden">
                <button
                  onClick={handlePreviewSlider}
                  aria-label="Zoom"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-dark transition-colors z-10"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </button>
                <Image
                  src={product.imgs.previews?.[activePreview] || "/images/placeholder.png"}
                  alt={product.title}
                  width={350}
                  height={350}
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-1/2">
            {product.hasDiscount && (
              <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-white bg-forest px-2.5 py-1 rounded-full mb-4">
                Sale
              </span>
            )}

            <h3 className="font-medium text-xl sm:text-2xl text-dark mb-3">
              {product.title}
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.reviews || 0} reviews)</span>
            </div>

            {product.description && (
              <p
                className="text-sm text-gray-500 leading-relaxed mb-6"
                dangerouslySetInnerHTML={{
                  __html: product.description?.substring(0, 150) + "..."
                }}
              />
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-xl text-dark">
                  ₹{product.discountedPrice || product.price}
                </span>
                {product.discountedPrice && product.price !== product.discountedPrice && (
                  <span className="text-gray-400 line-through text-sm">₹{product.price}</span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Quantity</p>
              <div className="inline-flex items-center border border-gray-200 rounded-full">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-dark transition-colors"
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="currentColor"><rect width="14" height="2" rx="1" /></svg>
                </button>
                <span className="w-10 text-center text-sm font-medium text-dark">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-dark transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect y="6" width="14" height="2" rx="1" /><rect x="6" width="2" height="14" rx="1" /></svg>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-forest text-white py-3.5 rounded-full text-sm font-medium hover:bg-dark transition-colors duration-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
