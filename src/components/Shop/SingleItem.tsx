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
import NotifyMeModal from "@/components/NotifyMeModal";
import MushroomBenefitsIcon from "./MushroomBenefitsIcon";

const SingleItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  
  console.log('SingleItem render - isNotifyModalOpen:', isNotifyModalOpen, 'inStock:', item.inStock);

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
    // Debug: Log what product data is being stored
    console.log('SingleItem: Navigating to product details:', {
      id: item.id,
      title: item.title,
      slug: item.slug,
      price: item.price
    });
    
    // Clear any existing product details from localStorage to prevent stale data
    localStorage.removeItem("productDetails");
    // Set the new product details
    localStorage.setItem("productDetails", JSON.stringify(item));
    
    // Debug: Verify localStorage was set correctly
    const storedItem = localStorage.getItem("productDetails");
    console.log('SingleItem: Product data stored in localStorage:', storedItem ? JSON.parse(storedItem).title : 'None');
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
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isInWishlist(item.id) 
              ? "bg-red text-white" 
              : "bg-white text-dark-4 hover:bg-red hover:text-white"
          } ${isWishlistLoading ? "opacity-50" : ""}`}
          aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            className="fill-current"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.97441 12.6073L6.43872 12.0183L5.97441 12.6073ZM7.99992 3.66709L7.45955 4.18719C7.60094 4.33408 7.79604 4.41709 7.99992 4.41709C8.2038 4.41709 8.3989 4.33408 8.54028 4.18719L7.99992 3.66709ZM10.0254 12.6073L10.4897 13.1962L10.0254 12.6073ZM6.43872 12.0183C5.41345 11.21 4.33627 10.4524 3.47904 9.48717C2.64752 8.55085 2.08325 7.47831 2.08325 6.0914H0.583252C0.583252 7.94644 1.3588 9.35867 2.35747 10.4832C3.33043 11.5788 4.57383 12.4582 5.51009 13.1962L6.43872 12.0183ZM2.08325 6.0914C2.08325 4.75102 2.84027 3.63995 3.85342 3.17683C4.81929 2.73533 6.15155 2.82823 7.45955 4.18719L8.54028 3.14699C6.84839 1.38917 4.84732 1.07324 3.22983 1.8126C1.65962 2.53035 0.583252 4.18982 0.583252 6.0914H2.08325ZM5.51009 13.1962C5.84928 13.4636 6.22932 13.7618 6.61834 13.9891C7.00711 14.2163 7.47619 14.4167 7.99992 14.4167V12.9167C7.85698 12.9167 7.65939 12.8601 7.37512 12.694C7.0911 12.5281 6.79171 12.2965 6.43872 12.0183L5.51009 13.1962ZM10.4897 13.1962C11.426 12.4582 12.6694 11.5788 13.6424 10.4832C14.641 9.35867 15.4166 7.94644 15.4166 6.0914H13.9166C13.9166 7.47831 13.3523 8.55085 12.5208 9.48717C11.6636 10.4524 10.5864 11.21 9.56112 12.0183L10.4897 13.1962ZM15.4166 6.0914C15.4166 4.18982 14.3402 2.53035 12.77 1.8126C11.1525 1.07324 9.15145 1.38917 7.45955 3.14699L8.54028 4.18719C9.84828 2.82823 11.1805 2.73533 12.1464 3.17683C13.1596 3.63995 13.9166 4.75102 13.9166 6.0914H15.4166ZM9.56112 12.0183C9.20813 12.2965 8.90874 12.5281 8.62471 12.694C8.34044 12.8601 8.14285 12.9167 7.99992 12.9167V14.4167C8.52365 14.4167 8.99273 14.2163 9.3815 13.9891C9.77052 13.7618 10.1506 13.4636 10.4897 13.1962L9.56112 12.0183Z"
              fill=""
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
                  console.log('Notify Me clicked for product:', item.id, item.title);
                  console.log('Current modal state:', isNotifyModalOpen);
                  setIsNotifyModalOpen(true);
                }}
                className="inline-flex font-medium text-sm text-white bg-forest py-2 px-4 rounded-full ease-out duration-200 hover:bg-dark"
              >
                Notify Me
              </button>
            ) : (
              <Link
                href={`/shop-details/${item.slug}`}
                onClick={handleNavigateToDetails}
                className="inline-flex font-medium text-sm text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                View Details
              </Link>
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