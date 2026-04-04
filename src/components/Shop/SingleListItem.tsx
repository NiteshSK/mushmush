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
import StarRating from "@/components/Common/StarRating";
import Image from "next/image";
import toast from "react-hot-toast";

type Props = {
  item: Product;
  priority?: boolean;
  onNotifyMe?: (product: Product) => void;
};

const SingleListItem = ({ item, priority = false, onNotifyMe }: Props) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      discountedPrice: item.discountedPrice,
      quantity: 1,
      imgs: item.imgs,
    }));
    toast.success("Added to cart!");
  };

  const handleItemToWishList = async () => {
    setIsWishlistLoading(true);
    try {
      if (isInWishlist(item.id)) {
        const success = await removeFromWishlist(item.id);
        if (success) {
          toast.success("Removed from wishlist");
        }
      } else {
        const success = await addToWishlist(item.id);
        if (success) {
          toast.success("Added to wishlist!");
        }
      }
    } catch (error) {
      toast.error("Please sign in to manage wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // --- UPDATED: This function now runs for ALL products ---
  const handleNavigateToDetails = () => {
    // Always set localStorage on click, regardless of stock status
    localStorage.setItem("productDetails", JSON.stringify(item));
  };

  return (
    <div className="group flex items-center gap-6 rounded-xl bg-white p-4 border border-gray-100 hover:shadow-sm transition-shadow duration-200">
      <div className="relative overflow-hidden w-1/4">
        <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
          <Image
            src={item.imgs.thumbnails[0]}
            alt={item.title}
            width={200}
            height={200}
            priority={priority}
            className={`rounded-xl transition-all duration-300 ${
              !item.inStock ? "grayscale" : ""
            }`}
          />
        </Link>
        {!item.inStock ? (
          <div className="sold-out-overlay"><span>Sold Out</span></div>
        ) : item.hasDiscount && item.discountPercentage ? (
          <div className="absolute top-2 left-2 bg-forest text-white text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full z-10">
            {item.discountPercentage}% OFF
          </div>
        ) : null}
      </div>

      <div className="w-3/4">
        <h3 className="font-medium text-lg text-dark hover:text-forest transition-colors duration-200 mb-2">
          {/* --- UPDATED: Link is now always active --- */}
          <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
            {item.title}
          </Link>
        </h3>
        
        <div className="mb-3">
          <StarRating rating={item.averageRating ?? 0} count={item.reviewCount ?? 0} />
        </div>
        
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium text-lg">
                {item.hasDiscount ? (
                  <>
                    <span className="text-dark">₹{item.discountedPrice}</span>
                    <span className="text-dark-4 line-through">₹{item.price}</span>
                  </>
                ) : (
                  <span className="text-dark">₹{item.price}</span>
                )}
            </span>
            
            <div className="flex items-center gap-2">
              {item.inStock ? (
                  <button onClick={handleAddToCart} className="inline-flex font-medium text-sm py-2 px-6 rounded-full bg-forest text-white transition-colors duration-300 hover:bg-dark">
                      Add to Cart
                  </button>
              ) : (
                  <button
                      onClick={() => onNotifyMe?.(item)}
                      className="inline-flex font-medium text-sm py-2 px-6 rounded-full bg-forest text-white transition-colors duration-300 hover:bg-dark"
                  >
                      Notify Me
                  </button>
              )}
              
              <button
                onClick={handleItemToWishList}
                disabled={isWishlistLoading}
                aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
                className={`flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${isWishlistLoading ? "opacity-50" : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill={isInWishlist(item.id) ? "#ef4444" : "none"}
                    stroke={isInWishlist(item.id) ? "#ef4444" : "#9ca3af"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;