"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useWishlist } from "@/app/context/WishlistContext";
import SingleItem from "./SingleItem";
import Link from "next/link";

export const Wishlist = () => {
  const { items: wishlistItems, loading, removeFromWishlist } = useWishlist();

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />

      <section className="py-10 sm:py-14 bg-gray-50 min-h-[60vh]">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h2 className="font-medium text-xl text-dark mb-2">Your wishlist is empty</h2>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                Add items that you like to your wishlist.<br />
                Review them anytime and easily move them to the bag.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-forest text-white text-custom-sm font-medium py-3 px-8 rounded-full hover:bg-dark transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Header bar */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-dark">
                  My Wishlist
                  <span className="text-gray-400 font-normal ml-1.5">
                    {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}
                  </span>
                </h2>
              </div>

              {/* Product grid — like Flipkart/Myntra */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {wishlistItems.map((wishlistItem) => (
                  <SingleItem
                    item={wishlistItem.product}
                    onRemoveFromWishlist={removeFromWishlist}
                    key={wishlistItem.product.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};
