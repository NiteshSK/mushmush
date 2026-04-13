"use client";
import React, { useState } from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useWishlist } from "@/app/context/WishlistContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import StarRating from "@/components/Common/StarRating";

type Props = {
  item: Product;
  priority?: boolean;
  onNotifyMe?: (product: Product) => void;
};

const SingleGridItem = ({ item, priority = false, onNotifyMe }: Props) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

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

  const handleItemToWishList = async () => {
    setIsWishlistLoading(true);
    try {
      if (isInWishlist(item.id)) {
        const success = await removeFromWishlist(item.id);
        if (success) toast.success("Removed from wishlist");
      } else {
        const success = await addToWishlist(item.id);
        if (success) toast.success("Added to wishlist!");
      }
    } catch {
      toast.error("Please sign in to manage wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleNavigateToDetails = () => {
    // Product details are fetched fresh from API by slug — no localStorage needed
  };

  const shortDescription = item.description
    ? item.description.replace(/<[^>]+>/g, "").slice(0, 50).trim()
    : "";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Image area — matches homepage SingleItem */}
      <div className="relative bg-white flex items-center justify-center" style={{ height: 240 }}>
        {/* Badge — always top-left */}
        {!item.inStock ? (
          <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider text-white bg-dark/70 px-2.5 py-1 rounded-full z-10">
            Sold Out
          </span>
        ) : item.hasDiscount && item.discountPercentage ? (
          <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider text-white bg-forest px-2.5 py-1 rounded-full z-10">
            -{item.discountPercentage}%
          </span>
        ) : null}

        {/* Wishlist — always top-right */}
        <button
          onClick={handleItemToWishList}
          disabled={isWishlistLoading}
          aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-sm ${
            isWishlistLoading ? "opacity-50" : ""
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill={isInWishlist(item.id) ? "#ef4444" : "none"}
              stroke={isInWishlist(item.id) ? "#ef4444" : "#d1d5db"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Quick View — appears on hover */}
        {item.inStock && (
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            aria-label="Quick view"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[10px] uppercase tracking-wider font-medium text-dark bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-dark hover:text-white hover:border-dark"
          >
            Quick view
          </button>
        )}

        <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
          <Image
            src={item.imgs.thumbnails[0]}
            alt={item.title}
            width={200}
            height={200}
            priority={priority}
            className={`object-contain max-h-[190px] transition-transform duration-500 group-hover:scale-105 ${
              !item.inStock ? "opacity-50 grayscale" : ""
            }`}
          />
        </Link>
      </div>

      {/* Info area — matches homepage SingleItem */}
      <div className="flex flex-col flex-1 px-4 pt-4 pb-5 gap-1.5">
        {/* Title */}
        <h3 className="font-medium text-dark text-sm ease-out duration-200 hover:text-blue line-clamp-2">
          <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
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
        <StarRating
          rating={item.averageRating ?? 0}
          count={item.reviewCount ?? 0}
          size={13}
        />

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-1">
          {item.hasDiscount && item.discountedPrice ? (
            <>
              <span className="text-sm font-semibold text-dark">
                &#8377;{item.discountedPrice}
              </span>
              <span className="text-xs text-gray-5 line-through">
                &#8377;{item.price}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-dark">
              &#8377;{item.price}
            </span>
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

export default SingleGridItem;
