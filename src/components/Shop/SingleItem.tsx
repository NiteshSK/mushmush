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

const SingleItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
      })
    );
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        ...item,
        quantity: 1,
      })
    );
  };

  const handleNavigateToDetails = () => {
    localStorage.setItem("productDetails", JSON.stringify(item));
  };

  return (
    <div className="group flex flex-col h-full bg-white rounded-lg shadow-1 overflow-hidden transition-shadow duration-300 hover:shadow-2">
      {/* Image container with a fixed aspect ratio */}
      <div className="relative aspect-square">
        <Link href="/shop-details" onClick={handleNavigateToDetails} className="block w-full h-full">
          <Image
            src={item.imgs.previews[0]}
            alt={item.title}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
              !item.inStock ? "grayscale" : ""
            }`}
          />
        </Link>
        {!item.inStock && (
          <div className="absolute top-3 right-3 bg-dark text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content container */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Star ratings restored */}
        <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Image key={i} src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15}/>
                ))}
            </div>
            <p className="text-custom-sm text-gray-500">({item.reviews})</p>
        </div>

        <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-2 text-lg flex-grow">
          <Link href="/shop-details" onClick={handleNavigateToDetails}>
            {item.title}
          </Link>
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2">
            <span className="flex items-center gap-2 font-medium text-lg">
                <span className="text-dark">₹{item.discountedPrice}</span>
                <span className="text-dark-4 line-through text-sm">₹{item.price}</span>
            </span>

            {item.inStock ? (
                <Link href="/shop-details" onClick={handleNavigateToDetails} className="inline-flex font-medium text-sm text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark">
                    View Details
                </Link>
            ) : (
                <button className="inline-flex font-medium text-sm text-white bg-dark py-2 px-4 rounded-md ease-out duration-200 hover:bg-opacity-90">
                    Notify Me
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
