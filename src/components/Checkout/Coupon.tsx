"use client";
import React, { useState } from "react";

interface AppliedCoupon {
  code: string;
  couponId: number;
  discountAmount: number;
  message: string;
}

interface CouponProps {
  subtotal: number;
  email: string;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
  appliedCoupon: AppliedCoupon | null;
}

const Coupon = ({ subtotal, email, onApply, onRemove, appliedCoupon }: CouponProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;

    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          subtotal,
          email,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        onApply({
          code: data.code,
          couponId: data.couponId,
          discountAmount: data.discountAmount,
          message: data.message,
        });
        setError("");
      } else {
        setError(data.message || "Invalid coupon code.");
      }
    } catch {
      setError("Failed to validate coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError("");
    onRemove();
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have a Coupon Code?</h3>
      </div>

      <div className="py-6 px-4 sm:px-8.5">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-forest/5 border border-forest/20 rounded-lg px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-forest text-sm bg-forest/10 px-2 py-0.5 rounded">
                  {appliedCoupon.code}
                </span>
                <span className="text-sm text-forest font-medium">
                  -₹{appliedCoupon.discountAmount}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{appliedCoupon.message}</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-red hover:text-red-dark text-sm font-medium ml-4"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-4">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                placeholder="Enter coupon code"
                className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20 font-mono uppercase"
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={loading || !code.trim()}
                className="inline-flex font-medium text-white bg-forest py-3 px-6 rounded-lg ease-out duration-200 hover:bg-dark disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? "Checking..." : "Apply"}
              </button>
            </div>
            {error && (
              <p className="text-red text-sm mt-2">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupon;
