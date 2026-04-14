import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateCartItemQuantity } from "@/redux/features/cart-slice";
import Image from "next/image";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const SingleItem = ({ item, removeItemFromCart }: { item: any; removeItemFromCart: any }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { closeCartModal } = useCartModalContext();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
  };

  const handleIncrease = () => {
    const maxQty = item.stockQuantity ?? Infinity;
    if (quantity >= maxQty) return;
    const newQty = quantity + 1;
    setQuantity(newQty);
    dispatch(updateCartItemQuantity({ id: item.id, quantity: newQty }));
  };

  const handleDecrease = () => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;
    setQuantity(newQty);
    dispatch(updateCartItemQuantity({ id: item.id, quantity: newQty }));
  };

  const unitPrice = item.discountedPrice || item.price;
  const maxQty = item.stockQuantity ?? Infinity;
  const atMax = quantity >= maxQty;

  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center rounded-lg bg-cream w-[70px] h-[70px] flex-shrink-0">
        <Image src={item.imgs?.thumbnails[0]} alt="product" width={60} height={60} className="object-contain" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-dark mb-1 ease-out duration-200 hover:text-forest leading-tight">
          <Link href={`/shop-details/${item.slug}`} onClick={() => closeCartModal()}>
            {item.title}
          </Link>
        </h3>

        <p className="text-xs text-gray-500 mb-1">₹{unitPrice} each</p>
        {item.stockQuantity !== undefined && item.stockQuantity <= 10 && (
          <p className="text-xs text-amber-600 mb-1">Only {item.stockQuantity} left</p>
        )}

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center border border-gray-200 rounded-full">
            <button
              onClick={handleDecrease}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-dark transition-colors"
              aria-label="Decrease quantity"
            >
              <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor"><rect width="10" height="2" rx="1" /></svg>
            </button>
            <span className="w-7 text-center text-xs font-medium text-dark">{quantity}</span>
            <button
              onClick={handleIncrease}
              disabled={atMax}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect y="4" width="10" height="2" rx="1" /><rect x="4" width="2" height="10" rx="1" /></svg>
            </button>
          </div>

          {/* Total + Remove */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-dark">₹{unitPrice * quantity}</span>
            <button
              onClick={handleRemoveFromCart}
              aria-label="Remove from cart"
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-light-6 hover:text-red transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
