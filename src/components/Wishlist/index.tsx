"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useWishlist } from "@/app/context/WishlistContext";
import SingleItem from "./SingleItem";

export const Wishlist = () => {
  const { items: wishlistItems, loading, removeFromWishlist } = useWishlist();

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            <button className="text-blue">Clear Wishlist Cart</button>
          </div>

          {loading ? (
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <p className="text-dark-4">Loading your wishlist...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <p className="text-dark-4 mb-4">Your wishlist is empty</p>
              <p className="text-custom-sm text-dark-4">
                Add products to your wishlist to see them here
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark">Product</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark">Unit Price</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark">Stock Status</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark text-right">Action</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
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
