import React, { useState } from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/redux/features/cart-slice";
import Image from "next/image";
import Link from "next/link";

interface SingleItemProps {
  item: {
    id: number;
    title: string;
    slug?: string;
    price: number;
    discountedPrice?: number;
    quantity: number;
    stockQuantity?: number;
    imgs?: {
      thumbnails: string[];
      previews: string[];
    };
  };
}

const SingleItem = ({ item }: SingleItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
  };

  const handleIncreaseQuantity = () => {
    const maxQty = item.stockQuantity ?? Infinity;
    if (quantity >= maxQty) return;
    setQuantity(quantity + 1);
    dispatch(updateCartItemQuantity({ id: item.id, quantity: quantity + 1 }));
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      dispatch(updateCartItemQuantity({ id: item.id, quantity: quantity - 1 }));
    }
  };

  const unitPrice = item.discountedPrice || item.price;
  const maxQty = item.stockQuantity ?? Infinity;
  const atMax = quantity >= maxQty;

  return (
    <>
      {/* Desktop layout — hidden on mobile */}
      <div className="hidden md:flex items-center border-t border-gray-100 py-5 px-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg bg-gray-1 w-[70px] h-[70px] flex-shrink-0">
              <Image width={60} height={60} src={item.imgs?.thumbnails[0] || ''} alt={item.title} className="object-contain" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-dark hover:text-forest transition-colors truncate">
                <Link href={`/shop-details/${item.slug || '#'}`}>{item.title}</Link>
              </h3>
              {item.stockQuantity !== undefined && item.stockQuantity <= 10 && (
                <p className="text-xs text-amber-600 mt-0.5">Only {item.stockQuantity} left in stock!</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-[120px] text-center">
          <p className="text-sm text-dark">₹{unitPrice}</p>
        </div>

        <div className="w-[160px] flex justify-center">
          <div className="inline-flex items-center border border-gray-200 rounded-full">
            <button
              onClick={handleDecreaseQuantity}
              aria-label="Decrease quantity"
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-dark transition-colors"
            >
              <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1" /></svg>
            </button>
            <span className="w-9 text-center text-sm font-medium text-dark">{quantity}</span>
            <button
              onClick={handleIncreaseQuantity}
              disabled={atMax}
              aria-label="Increase quantity"
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect y="5" width="12" height="2" rx="1" /><rect x="5" width="2" height="12" rx="1" /></svg>
            </button>
          </div>
        </div>

        <div className="w-[100px] text-right">
          <p className="text-sm font-medium text-dark">₹{unitPrice * quantity}</p>
        </div>

        <div className="w-[50px] flex justify-end">
          <button
            onClick={handleRemoveFromCart}
            aria-label="Remove from cart"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red/5 hover:text-red transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile layout — card style */}
      <div className="md:hidden border-t border-gray-100 p-4">
        <div className="flex gap-4">
          <div className="flex items-center justify-center rounded-lg bg-gray-1 w-[70px] h-[70px] flex-shrink-0">
            <Image width={60} height={60} src={item.imgs?.thumbnails[0] || ''} alt={item.title} className="object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-dark truncate mb-1">
              <Link href={`/shop-details/${item.slug || '#'}`}>{item.title}</Link>
            </h3>
            <p className="text-sm text-dark font-medium mb-1">₹{unitPrice}</p>
            {item.stockQuantity !== undefined && item.stockQuantity <= 10 && (
              <p className="text-xs text-amber-600 mb-2">Only {item.stockQuantity} left in stock!</p>
            )}

            <div className="flex items-center justify-between">
              <div className="inline-flex items-center border border-gray-200 rounded-full">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-dark"
                >
                  <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor"><rect width="10" height="2" rx="1" /></svg>
                </button>
                <span className="w-8 text-center text-xs font-medium">{quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  disabled={atMax}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-dark disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect y="4" width="10" height="2" rx="1" /><rect x="4" width="2" height="10" rx="1" /></svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-dark">₹{unitPrice * quantity}</span>
                <button
                  onClick={handleRemoveFromCart}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red/5 hover:text-red transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleItem;
