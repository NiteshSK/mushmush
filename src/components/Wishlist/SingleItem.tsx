import React from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface SingleItemProps {
  item: Product;
  onRemoveFromWishlist: (productId: number) => Promise<boolean>;
}

const SingleItem = ({ item, onRemoveFromWishlist }: SingleItemProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveFromWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await onRemoveFromWishlist(item.id);
    if (success) toast.success("Removed from wishlist");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className="group relative border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-200 flex flex-col h-full overflow-hidden">
      {/* Remove button — top right X */}
      <button
        onClick={handleRemoveFromWishlist}
        aria-label="Remove from wishlist"
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red hover:border-red transition-colors duration-200"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Image */}
      <Link
        href={`/shop-details/${item.slug}`}
        className="block relative bg-gray-50 aspect-[4/5] flex items-center justify-center"
      >
        <Image
          src={item.imgs?.thumbnails[0]}
          alt={item.title}
          width={300}
          height={375}
          className={`object-contain w-full h-full p-4 ${!item.inStock ? "opacity-40 grayscale" : ""}`}
        />
        {!item.inStock && (
          <span className="absolute bottom-0 left-0 right-0 bg-dark/70 text-white text-[10px] uppercase tracking-wider font-medium text-center py-1.5">
            Out of Stock
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="px-3.5 pt-3 pb-3 flex flex-col flex-1">
        <Link href={`/shop-details/${item.slug}`}>
          <h3 className="text-sm text-dark font-medium line-clamp-1 hover:text-forest transition-colors">
            {item.title}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-1">
          {item.hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-dark">
                &#8377;{item.discountedPrice}
              </span>
              <span className="text-xs text-gray-400 line-through">
                &#8377;{item.price}
              </span>
              {item.discountPercentage && (
                <span className="text-xs font-medium text-forest">
                  ({item.discountPercentage}% off)
                </span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-dark">
              &#8377;{item.price}
            </span>
          )}
        </div>
      </div>

      {/* Full-width bottom CTA — Flipkart/Myntra style */}
      <div className="border-t border-gray-200 mt-auto">
        {item.inStock ? (
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-forest uppercase tracking-wide hover:bg-forest hover:text-white transition-all duration-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add to Cart
          </button>
        ) : (
          <button
            disabled
            className="w-full py-3 text-sm font-medium text-gray-400 uppercase tracking-wide cursor-not-allowed"
          >
            Currently Unavailable
          </button>
        )}
      </div>
    </div>
  );
};

export default SingleItem;
