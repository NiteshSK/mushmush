"use client";
import React, { useEffect } from "react";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  removeItemFromCart,
  selectTotalPrice,
} from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import SingleItem from "./SingleItem";
import Link from "next/link";
import EmptyCart from "./EmptyCart";

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  const totalPrice = useSelector(selectTotalPrice);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (!event.target.closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed top-0 left-0 z-99999 overflow-y-auto no-scrollbar w-full h-screen bg-black/40 ease-linear duration-300 ${
        isCartModalOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-end">
        <div className="w-full sm:max-w-[440px] shadow-2xl bg-white relative modal-content flex flex-col h-screen">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
            <h2 className="font-medium text-lg text-dark">
              Cart ({cartItems.length})
            </h2>
            <button
              onClick={() => closeCartModal()}
              aria-label="Close cart"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-5">
              {cartItems.length > 0 ? (
                cartItems.map((item, key) => (
                  <SingleItem
                    key={key}
                    item={item}
                    removeItemFromCart={removeItemFromCart}
                  />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="font-medium text-lg text-dark">₹{totalPrice}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  onClick={() => closeCartModal()}
                  href="/checkout"
                  className="w-full flex justify-center font-medium text-white bg-forest py-3.5 rounded-full text-sm hover:bg-dark transition-colors duration-300"
                >
                  Checkout
                </Link>
                <Link
                  onClick={() => closeCartModal()}
                  href="/cart"
                  className="w-full flex justify-center font-medium text-dark bg-white border border-gray-200 py-3.5 rounded-full text-sm hover:border-gray-400 transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
