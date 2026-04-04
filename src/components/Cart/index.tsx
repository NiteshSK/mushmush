"use client";
import React from "react";
import OrderSummary from "./OrderSummary";
import { useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

const Cart = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  return (
    <>
      <Breadcrumb title={"Cart"} pages={["Cart"]} />

      {cartItems.length > 0 ? (
        <section className="py-12 sm:py-16">
          <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
            <div className="bg-white rounded-lg border border-gray-100">
              {/* Desktop header — hidden on mobile */}
              <div className="hidden md:flex items-center py-4 px-6 border-b border-gray-100">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Product</p>
                </div>
                <div className="w-[120px] text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Price</p>
                </div>
                <div className="w-[160px] text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quantity</p>
                </div>
                <div className="w-[100px] text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Subtotal</p>
                </div>
                <div className="w-[50px]"></div>
              </div>

              {cartItems.map((item, key) => (
                <SingleItem item={item} key={key} />
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-10">
              <OrderSummary />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className="font-medium text-xl text-dark mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-400 mb-8">Looks like you haven't added any items yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-forest text-white text-sm font-medium py-3 px-8 rounded-full hover:bg-dark transition-colors duration-300"
            >
              Continue Shopping
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Cart;
