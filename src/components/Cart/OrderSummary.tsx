import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

const CONVENIENCE_FEE = 12;

const OrderSummary = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  // Shipping estimate
  const [pincode, setPincode] = useState('');
  const [checking, setChecking] = useState(false);
  const [shippingResult, setShippingResult] = useState<{
    deliverable: boolean;
    shippingFee?: number;
    estimatedDays?: string;
    freeAbove?: number | null;
    freeShipping?: boolean;
    message?: string;
  } | null>(null);

  const checkShipping = async () => {
    if (!/^\d{6}$/.test(pincode)) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/shipping/check?pincode=${pincode}&subtotal=${totalPrice}`);
      const data = await res.json();
      setShippingResult(data);
    } catch {
      setShippingResult(null);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="lg:max-w-[455px] w-full">
      {/* <!-- order list box --> */}
      <div className="bg-white border border-gray-100 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartItems.map((item, key) => (
            <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
              <div>
                <p className="text-dark">{item.title}</p>
              </div>
              <div>
                <p className="text-dark text-right">
                  ₹{(item.discountedPrice || item.price) * item.quantity}
                </p>
              </div>
            </div>
          ))}

          {/* Shipping estimate */}
          <div className="py-5 border-b border-gray-3">
            <p className="text-sm text-dark mb-2.5 font-medium">Estimate Shipping</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPincode(val);
                  if (val.length < 6) setShippingResult(null);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); checkShipping(); } }}
                placeholder="Enter pincode"
                maxLength={6}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2 px-3.5 text-sm text-dark placeholder:text-gray-400 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
              />
              <button
                type="button"
                onClick={checkShipping}
                disabled={pincode.length !== 6 || checking}
                className="px-3.5 py-2 bg-forest text-white text-xs font-medium rounded-lg hover:bg-dark transition-colors disabled:opacity-50"
              >
                {checking ? '...' : 'Check'}
              </button>
            </div>
            {shippingResult && (
              <div className={`mt-2.5 text-sm ${shippingResult.deliverable ? 'text-forest' : 'text-red-500'}`}>
                {shippingResult.deliverable ? (
                  <span>
                    {shippingResult.freeShipping ? 'Free delivery' : `Shipping: ₹${shippingResult.shippingFee}`}
                    {shippingResult.estimatedDays && ` · ${shippingResult.estimatedDays}`}
                  </span>
                ) : (
                  <span>{shippingResult.message}</span>
                )}
              </div>
            )}
          </div>

          {/* Convenience fee */}
          <div className="flex items-center justify-between py-3 border-b border-gray-3">
            <p className="text-sm text-dark">Convenience Fee</p>
            <p className="text-sm text-dark text-right">₹{CONVENIENCE_FEE}</p>
          </div>

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                ₹{(totalPrice + CONVENIENCE_FEE + (shippingResult?.deliverable ? (shippingResult.shippingFee || 0) : 0)).toFixed(2)}
              </p>
              {shippingResult?.deliverable && shippingResult.shippingFee !== undefined && shippingResult.shippingFee > 0 && (
                <p className="text-xs text-gray-400 text-right">(incl. ₹{shippingResult.shippingFee} shipping)</p>
              )}
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <Link
            href="/checkout"
            className="w-full flex justify-center font-medium text-white bg-forest py-3 px-6 rounded-full ease-out duration-200 hover:bg-dark mt-7.5"
          >
            Process to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
