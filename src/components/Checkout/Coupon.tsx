"use client";
import React, { useState } from "react";
import { rupees } from "../Pantry/catalogue";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

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

  if (appliedCoupon) {
    return (
      <div className={r.applied} role="status">
        <span><code>{appliedCoupon.code}</code> · −{rupees.format(appliedCoupon.discountAmount)}<br /><small>{appliedCoupon.message}</small></span>
        {/* type="button": this sits inside the checkout form and must not submit it. */}
        <button type="button" onClick={handleRemove} className={p.textAction} aria-label={`Remove coupon ${appliedCoupon.code}`}>Remove</button>
      </div>
    );
  }

  return (
    <details className={r.coupon} open={!!error || undefined}>
      <summary>Have a coupon code?</summary>
      <div className={r.input}>
        <label htmlFor="coupon-code" className={p.srOnly}>Coupon code</label>
        <div className={p.field}>
          <input
            id="coupon-code"
            type="text"
            value={code}
            autoComplete="off"
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
            placeholder="Coupon code"
          />
          <button type="button" onClick={handleApply} disabled={loading || !code.trim()}>
            {loading ? "Checking…" : "Apply"}
          </button>
        </div>
        {error && <p role="alert" className={r.pinResult} data-error>{error}</p>}
      </div>
    </details>
  );
};

export default Coupon;
