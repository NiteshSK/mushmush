"use client";
import React from "react";
import { Product } from "@/types/product";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

const StarRating = ({ rating = 5, count = 0 }: { rating?: number; count?: number }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 1L8.854 4.764L13 5.382L10 8.326L10.708 12.5L7 10.527L3.292 12.5L4 8.326L1 5.382L5.146 4.764L7 1Z"
              fill={star <= Math.round(rating) ? "#1a1a1a" : "none"}
              stroke={star <= Math.round(rating) ? "#1a1a1a" : "#d1d5db"}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      <span className="text-[11px] text-gray-400">({count})</span>
    </div>
  );
};

const SingleItem = ({
  item,
  onNotifyMe,
}: {
  item: Product;
  onNotifyMe?: (product: Product) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        discountedPrice: item.discountedPrice,
        quantity: 1,
        imgs: item.imgs,
      })
    );
    toast.success("Added to cart!");
  };

  const handleNavigateToDetails = () => {
    localStorage.setItem("productDetails", JSON.stringify(item));
  };

  // Short excerpt from description (strip HTML tags)
  const shortDescription = item.description
    ? item.description.replace(/<[^>]+>/g, "").slice(0, 50).trim()
    : "";

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Image area */}
      <div className="relative bg-[#f8f8f6] flex items-center justify-center" style={{ height: 220 }}>
        {/* Badge */}
        {item.hasDiscount && item.discountPercentage ? (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded z-10">
            UP TO -{item.discountPercentage}%
          </span>
        ) : !item.inStock ? (
          <span className="absolute top-3 right-3 bg-gray-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded z-10">
            OUT OF STOCK
          </span>
        ) : item.featured ? (
          <span className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded z-10">
            NEW
          </span>
        ) : null}

        {item.imgs?.previews?.[0] ? (
          <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
            <Image
              src={item.imgs.previews[0]}
              alt={item.title}
              width={180}
              height={180}
              className={`object-contain max-h-[180px] ${!item.inStock ? "grayscale opacity-60" : ""}`}
            />
          </Link>
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center text-gray-300">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-col flex-1 px-4 pt-4 pb-5 gap-1.5">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          {item.hasDiscount && item.discountedPrice ? (
            <>
              <span className="text-sm font-semibold text-dark">₹{item.discountedPrice}</span>
              <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-dark">₹{item.price}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue">
          <Link
            href={`/shop-details/${item.slug}`}
            onClick={handleNavigateToDetails}
          >
            {item.title}
          </Link>
        </h3>

        {/* Stars */}
        <StarRating rating={item.averageRating ?? 5} count={item.reviewCount ?? 0} />

        {/* Short description */}
        {shortDescription && (
          <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5 line-clamp-1">
            {shortDescription}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3">
          {item.inStock ? (
            <button
              onClick={handleAddToCart}
              className="w-full border border-gray-300 rounded-full py-2.5 text-custom-sm font-medium text-dark hover:bg-dark hover:text-white hover:border-dark transition-all duration-200"
            >
              Buy now
            </button>
          ) : (
            <button
              onClick={() => onNotifyMe?.(item)}
              className="w-full border border-gray-300 rounded-full py-2.5 text-custom-sm font-medium text-dark-4 hover:bg-gray-1 transition-all duration-200"
            >
              Notify me
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
