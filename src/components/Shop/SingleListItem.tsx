"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";

type Props = {
  item: Product;
  priority?: boolean;
};

const SingleListItem = ({ item, priority = false }: Props) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
  };

  const handleItemToWishList = () => {
    dispatch(addItemToWishlist({ ...item, quantity: 1 }));
  };

  // --- UPDATED: This function now runs for ALL products ---
  const handleNavigateToDetails = () => {
    // Always set localStorage on click, regardless of stock status
    localStorage.setItem("productDetails", JSON.stringify(item));
  };

  return (
    <div className="group flex items-center gap-6 rounded-lg bg-white p-4 shadow-1">
      <div className="relative overflow-hidden w-1/4">
        <Image
          src={item.imgs.thumbnails[0]}
          alt={item.title}
          width={200}
          height={200}
          priority={priority}
          className={`rounded-lg transition-all duration-300 ${
            !item.inStock ? "grayscale" : ""
          }`}
        />
        {!item.inStock && (
            <div className="absolute top-2 right-2 bg-dark text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                Out of Stock
            </div>
        )}
      </div>

      <div className="w-3/4">
        <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-2 text-xl">
          {/* --- UPDATED: Link is now always active --- */}
          <Link href="/shop-details" onClick={handleNavigateToDetails}>
            {item.title}
          </Link>
        </h3>
        
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                  <Image key={i} src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15}/>
              ))}
          </div>
          <p className="text-custom-sm">({item.reviews} Reviews)</p>
        </div>
        
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium text-xl">
                <span className="text-dark">₹{item.discountedPrice}</span>
                <span className="text-dark-4 line-through">₹{item.price}</span>
            </span>
            
            {item.inStock ? (
                <button onClick={handleAddToCart} className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark">
                    Add to Cart
                </button>
            ) : (
                <button className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-dark text-white ease-out duration-200 hover:bg-opacity-90">
                    Notify Me
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;