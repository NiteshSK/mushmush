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
import NotifyMeModal from "@/components/NotifyMeModal";
import MushroomBenefitsIcon from "./MushroomBenefitsIcon";

const SingleItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  
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
        stockQuantity: item.stockQuantity,
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

  const handleNavigateToDetails = () => {
    // Clear any existing product details from localStorage to prevent stale data
    // Product details fetched fresh from API by slug
  };

  return (
    <>
    <div className="group flex flex-col h-full bg-white rounded-lg shadow-1 overflow-hidden transition-shadow duration-300 hover:shadow-2 relative">
      {/* Product Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-1">
        <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails} className="block w-full h-full">
          <Image
            src={item.imgs.previews[0]}
            alt={item.title}
            fill
            className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
              !item.inStock ? "grayscale" : ""
            }`}
          />
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={handleItemToWishList}
          disabled={isWishlistLoading}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 ${isWishlistLoading ? "opacity-50" : ""}`}
          aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
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
        
        {/* Mushroom Benefits Icon */}
        <MushroomBenefitsIcon product={item} position={{ bottom: "4", left: "4" }} className="absolute" />
        
        {!item.inStock ? (
          <div className="absolute top-3 left-3 bg-dark text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
            Out of Stock
          </div>
        ) : item.hasDiscount && item.discountPercentage ? (
          <div className="absolute top-3 left-3 bg-green text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
            {item.discountPercentage}% OFF
          </div>
        ) : null}
      </div>

      {/* Content container */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <StarRating rating={item.averageRating ?? 0} count={item.reviewCount ?? item.reviews ?? 0} />
        </div>

        <h3 className="font-medium text-dark ease-out duration-200 hover:text-forest mb-2 text-lg flex-grow">
          <Link href={`/shop-details/${item.slug}`} onClick={handleNavigateToDetails}>
            {item.title}
          </Link>
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2">
            <span className="flex items-center gap-2 font-medium text-lg">
                {item.hasDiscount ? (
                  <>
                    <span className="text-dark">₹{item.discountedPrice}</span>
                    <span className="text-dark-4 line-through text-sm">₹{item.price}</span>
                  </>
                ) : (
                  <span className="text-dark">₹{item.price}</span>
                )}
            </span>

            {!item.inStock ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsNotifyModalOpen(true);
                }}
                className="inline-flex font-medium text-sm text-white bg-dark py-2 px-5 rounded-full ease-out duration-200 hover:bg-forest"
              >
                Notify Me
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
                className="inline-flex items-center gap-1.5 font-medium text-sm text-white bg-forest py-2 px-5 rounded-full ease-out duration-200 hover:bg-dark"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>
            )}
        </div>
      </div>
    </div>

    {/* Notify Me Modal */}
    <NotifyMeModal
      isOpen={isNotifyModalOpen}
      onClose={() => setIsNotifyModalOpen(false)}
      productId={item.id}
      productTitle={item.title}
    />
  </>
  );
};

export default SingleItem;