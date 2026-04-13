"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, ShieldCheck, Mail, Phone } from "lucide-react";
import { toast } from "react-hot-toast";
import type { ChatProduct } from "./ChatProductCard";

interface ChatCheckoutProps {
  product: ChatProduct;
  onBack: () => void;
  onProceedToPayment: (orderData: {
    orderNumber: string;
    orderId: string;
    total: number;
    customerName: string;
    email: string;
  }) => void;
}

type Step = "details" | "otp";

const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors";

const ChatCheckout: React.FC<ChatCheckoutProps> = ({ product, onBack, onProceedToPayment }) => {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Customer details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // OTP
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const finalPrice = product.hasDiscount && product.discountedPrice ? product.discountedPrice : product.price;
  const subtotal = finalPrice * quantity;
  const convenienceFee = 12;
  const shippingFee = subtotal >= 499 ? 0 : 49;
  const total = subtotal + convenienceFee + shippingFee;

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const validateDetails = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return false; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { toast.error("Please enter a valid email"); return false; }
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""))) { toast.error("Please enter a valid 10-digit phone number"); return false; }
    if (!street.trim()) { toast.error("Please enter your street address"); return false; }
    if (!city.trim()) { toast.error("Please enter your city"); return false; }
    if (!state.trim()) { toast.error("Please enter your state"); return false; }
    if (!zip.trim() || !/^\d{6}$/.test(zip)) { toast.error("Please enter a valid 6-digit pincode"); return false; }
    return true;
  };

  const sendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, customerName: name, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "OTP sent!");
        setStep("otp");
        setResendTimer(30);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;
    await sendOTP();
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    try {
      const address = { street, city, state, zip, country: "India" };
      const res = await fetch("/api/checkout/verify-and-place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          email,
          customerName: name,
          customerPhone: phone,
          billingAddress: address,
          shippingAddress: address,
          cartItems: [{ id: product.id, quantity, price: product.price, discountedPrice: product.discountedPrice }],
          subtotal,
          shippingFee,
          convenienceFee,
          total,
          paymentMethod: "bank",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Order placed! Proceed to payment.");
        onProceedToPayment({
          orderNumber: data.order.orderNumber,
          orderId: data.order.id,
          total: data.order.total,
          customerName: name,
          email,
        });
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const thumbnail = product.imgs?.thumbnails?.[0] || product.imgs?.previews?.[0] || "/images/placeholder.png";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={14} className="text-gray-600" />
        </button>
        <span className="text-xs font-semibold text-gray-800">
          {step === "details" ? "Checkout" : "Verify OTP"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Product summary */}
        <div className="flex gap-3 bg-forest/5 border border-forest/10 rounded-xl p-3">
          <img src={thumbnail} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{product.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Qty: {quantity}</span>
              <div className="flex items-center border border-gray-200 rounded-md">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded-l-md"
                >-</button>
                <span className="px-2 text-xs font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded-r-md"
                >+</button>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-gray-900">₹{subtotal}</p>
            {product.hasDiscount && product.discountedPrice && (
              <p className="text-[10px] text-gray-400 line-through">₹{product.price * quantity}</p>
            )}
          </div>
        </div>

        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="John Doe" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@email.com" required />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="9876543210" required />
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</label>
              <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass + " mb-2"} placeholder="Street address" required />
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="City" required />
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} placeholder="State" required />
                <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass} placeholder="Pincode" required />
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span><span>{shippingFee === 0 ? "Free" : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Convenience fee</span><span>₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-white py-2.5 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={12} className="animate-spin" /> Sending OTP...</> : <><ShieldCheck size={12} /> Continue & Verify</>}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <Mail size={12} className="inline mr-1" />
                We sent a verification code to <strong>{email}</strong>
                {phone && <><br /><Phone size={12} className="inline mr-1" />and to <strong>{phone}</strong></>}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Enter OTP *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={inputClass + " text-center text-base tracking-[0.5em] font-bold"}
                placeholder="• • • • • •"
                maxLength={6}
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Change details
              </button>
              <button
                type="button"
                onClick={sendOTP}
                disabled={resendTimer > 0 || loading}
                className="text-xs text-forest hover:text-green-700 disabled:text-gray-400"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full bg-forest text-white py-2.5 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={12} className="animate-spin" /> Placing Order...</> : "Verify & Place Order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatCheckout;
