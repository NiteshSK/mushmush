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
    localStorage.setItem("productDetails", JSON.stringify(item));
  };

  return (
    <div className="group">
      {/* Image */}
      <div className="relative overflow-hidden rounded-xl bg-white aspect-square mb-4">
        <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
          <Image
            src={item.imgs.thumbnails[0]}
            alt={item.title}
            width={400}
            height={400}
            priority={priority}
            className={`w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 ${
              !item.inStock ? "opacity-50" : ""
            }`}
          />
        </Link>

        {/* Badges */}
        {!item.inStock ? (
          <div className="sold-out-overlay"><span>Sold Out</span></div>
        ) : item.hasDiscount && item.discountPercentage ? (
          <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider text-white bg-forest px-2.5 py-1 rounded-full">
            -{item.discountPercentage}%
          </span>
        ) : null}

        {/* Hover actions */}
        {item.inStock ? (
          <div className="absolute inset-0 flex items-end justify-center pb-4 gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => { openModal(); handleQuickViewUpdate(); }}
              aria-label="Quick view"
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-forest transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              onClick={handleAddToCart}
              className="h-9 px-5 rounded-full bg-forest text-white text-xs font-medium hover:bg-dark transition-colors shadow-md"
            >
              Add to Cart
            </button>
            <button
              onClick={handleItemToWishList}
              disabled={isWishlistLoading}
              aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
              className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${
                isInWishlist(item.id)
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-600 hover:text-forest"
              } ${isWishlistLoading ? "opacity-50" : ""}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isInWishlist(item.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
            <button
              onClick={() => onNotifyMe?.(item)}
              className="h-9 px-6 rounded-full bg-forest text-white text-xs font-medium hover:bg-dark transition-colors shadow-md"
            >
              Notify Me
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="text-sm font-medium text-dark mb-1 group-hover:text-forest transition-colors">
          <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
            {item.title}
          </Link>
        </h3>
        <div className="flex items-center gap-2">
          {item.hasDiscount ? (
            <>
              <span className="text-sm font-medium text-dark">₹{item.discountedPrice}</span>
              <span className="text-sm text-gray-400 line-through">₹{item.price}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-dark">₹{item.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleGridItem;
