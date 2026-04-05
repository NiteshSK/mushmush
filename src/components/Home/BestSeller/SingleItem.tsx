"use client";
import React from "react";
import { Product } from "@/types/product";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import StarRating from "@/components/Common/StarRating";

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
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Image area */}
      <div className="relative bg-white flex items-center justify-center rounded-xl" style={{ height: 260 }}>
        {/* Badge */}
        {item.hasDiscount && item.discountPercentage ? (
          <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider text-white bg-forest px-2.5 py-1 rounded-full z-10">
            -{item.discountPercentage}%
          </span>
        ) : !item.inStock ? (
          <div className="sold-out-overlay"><span>Sold Out</span></div>
        ) : item.featured ? (
          <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider text-blue border border-blue-light-4 bg-white px-2.5 py-1 rounded-full z-10">
            New
          </span>
        ) : null}

        {item.imgs?.previews?.[0] ? (
          <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
            <Image
              src={item.imgs.previews[0]}
              alt={item.title}
              width={200}
              height={200}
              className={`object-contain max-h-[200px] ${!item.inStock ? "grayscale opacity-60" : ""}`}
            />
          </Link>
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-300">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-col flex-1 px-4 pt-5 pb-5 gap-1.5">
        {/* Title */}
        <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue">
          <Link
            href={`/shop-details/${item.slug}`}
            onClick={handleNavigateToDetails}
          >
            {item.title}
          </Link>
        </h3>

        {/* Short description */}
        {shortDescription && (
          <p className="text-[11px] text-gray-5 leading-relaxed line-clamp-1">
            {shortDescription}
          </p>
        )}

        {/* Stars */}
        <StarRating rating={item.averageRating ?? 0} count={item.reviewCount ?? 0} size={13} />

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-1">
          {item.hasDiscount && item.discountedPrice ? (
            <>
              <span className="text-sm font-semibold text-dark">₹{item.discountedPrice}</span>
              <span className="text-xs text-gray-5 line-through">₹{item.price}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-dark">₹{item.price}</span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-3">
          {item.inStock ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-forest text-white rounded-full py-2.5 text-custom-sm font-medium hover:bg-dark transition-all duration-200"
            >
              Add to Cart
            </button>
          ) : (
            <button
              onClick={() => onNotifyMe?.(item)}
              className="w-full bg-forest text-white rounded-full py-2.5 text-custom-sm font-medium hover:bg-dark transition-all duration-200"
            >
              Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
