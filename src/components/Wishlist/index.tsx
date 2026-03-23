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

      <section className="py-12 sm:py-16">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h2 className="font-medium text-xl text-dark mb-2">Your wishlist is empty</h2>
              <p className="text-sm text-gray-400 mb-8">Save items you love to your wishlist.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-forest text-white text-sm font-medium py-3 px-8 rounded-full hover:bg-dark transition-colors duration-300"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[900px]">
                  <div className="flex items-center py-4 px-6 border-b border-gray-100">
                    <div className="min-w-[60px]"></div>
                    <div className="min-w-[350px]">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Product</p>
                    </div>
                    <div className="min-w-[180px]">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Price</p>
                    </div>
                    <div className="min-w-[180px]">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Status</p>
                    </div>
                    <div className="min-w-[130px]">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400 text-right">Action</p>
                    </div>
                  </div>

                  {wishlistItems.map((wishlistItem, key) => (
                    <SingleItem
                      item={wishlistItem.product}
                      onRemoveFromWishlist={removeFromWishlist}
                      key={key}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
