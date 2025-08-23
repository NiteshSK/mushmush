// src/components/Checkout/Checkout.js (or index.js)

"use client";
import React from "react";
import { useSelector } from "react-redux";
// Import your custom selectors from your cart slice
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice"; 

import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";

const Checkout = () => {
  // Use your pre-built selectors to get data from the Redux store
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectTotalPrice);

  const shippingFee = 15.00; // This can be a fixed value or come from Redux/API
  const total = subtotal + shippingFee;

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* Checkout Left Column */}
              <div className="lg:max-w-[670px] w-full">
                <Login />
                <Billing />
                <Shipping />
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label htmlFor="notes" className="block mb-2.5">Other Notes (optional)</label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={5}
                    placeholder="Notes about your order, e.g. speacial notes for delivery."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  ></textarea>
                </div>
              </div>

              {/* Checkout Right Column (Your Order Summary) */}
              <div className="max-w-[455px] w-full">
                
                {/* === NEW BANNER ADDED HERE === */}
                <div 
  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-7.5" 
  role="alert"
>
  <p className="font-bold">Online Orders Paused</p>
  <p>
    We are not currently accepting orders from the website. To place an order, please reach out to us on WhatsApp or call us directly at: 
    <a 
      href="https://wa.me/917417165960" 
      target="_blank" 
      rel="noopener noreferrer"
      className="font-bold underline ml-1 hover:text-red-800"
    >
      (+91) 7417165960
    </a>
  </p>
</div>
                
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">Subtotal</h4>
                    </div>

                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <p className="text-dark">{item.title}</p>
                          <p className="text-dark text-right">₹{(item.discountedPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-5">
                        <p className="text-dark text-center">Your cart is empty.</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <p className="font-medium text-dark">Subtotal</p>
                      <p className="font-medium text-dark text-right">₹{subtotal.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <p className="text-dark">Shipping Fee</p>
                      <p className="text-dark text-right">₹{shippingFee.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">₹{total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <Coupon />
                <ShippingMethod />
                <PaymentMethod />

                {/* === BUTTON DISABLED AND STYLED === */}
                <button
                  type="submit"
                  disabled 
                  className="w-full flex justify-center font-medium text-white bg-gray-400 py-3 px-6 rounded-md mt-7.5 cursor-not-allowed"
                >
                  Process to Checkout
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;