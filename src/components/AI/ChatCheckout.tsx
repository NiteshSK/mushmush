"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, MapPin, Minus, Plus, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import type { ChatProduct } from "./ChatProductCard";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { packLabel, rupees } from "@/components/Pantry/catalogue";
import s from "../Pantry/chat.module.css";

interface UserInfo {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface ChatCheckoutProps {
  product: ChatProduct;
  onBack: () => void;
  onProceedToPayment: (orderData: {
    orderNumber: string;
    orderId: string;
    total: number;
    customerName: string;
    email: string;
    paymentToken: string;
  }) => void;
  userInfo?: UserInfo;
}

interface ShippingInfo {
  deliverable: boolean;
  shippingFee: number;
  zoneName?: string;
  estimatedDays?: string;
  freeShipping?: boolean;
  freeAbove?: number | null;
  message?: string;
}

type Step = "details" | "otp";

const ChatCheckout: React.FC<ChatCheckoutProps> = ({ product, onBack, onProceedToPayment, userInfo }) => {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Customer details — pre-fill from session
  const [name, setName] = useState(userInfo?.name || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Shipping — fetched from API based on pincode
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [checkingShipping, setCheckingShipping] = useState(false);

  // OTP
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const originalSubtotal = product.price * quantity;
  const hasDiscount = product.hasDiscount && product.discountedPrice;
  const discountedSubtotal = hasDiscount ? product.discountedPrice! * quantity : originalSubtotal;
  const productDiscount = originalSubtotal - discountedSubtotal;
  const convenienceFee = CONVENIENCE_FEE;
  const total = discountedSubtotal + (shippingFee ?? 0) + convenienceFee;
  // Total from the server after a price change; the shopper confirms it with the same OTP.
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  useEffect(() => setServerTotal(null), [total]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    let active = true;
    setShippingInfo(null);
    setShippingFee(null);
    if (!/^\d{6}$/.test(zip)) {
      setCheckingShipping(false);
      return;
    }
    setCheckingShipping(true);
    const url = `/api/shipping/check?pincode=${zip}&subtotal=${discountedSubtotal}&productId=${product.id}`;
    fetch(url)
      .then(response => response.json())
      .then((quote: ShippingInfo) => {
        if (!active) return;
        setShippingInfo(quote);
        setShippingFee(quote.deliverable ? quote.shippingFee : null);
      })
      .catch(() => {
        if (active) setShippingInfo(null);
      })
      .finally(() => {
        if (active) setCheckingShipping(false);
      });
    return () => { active = false; };
  }, [zip, discountedSubtotal, product.id]);

  const handleZipChange = (value: string) => setZip(value.replace(/\D/g, "").slice(0, 6));

  const validateDetails = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return false; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { toast.error("Please enter a valid email"); return false; }
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""))) { toast.error("Please enter a valid 10-digit phone number"); return false; }
    if (!street.trim()) { toast.error("Please enter your street address"); return false; }
    if (!city.trim()) { toast.error("Please enter your city"); return false; }
    if (!state.trim()) { toast.error("Please enter your state"); return false; }
    if (!zip.trim() || !/^\d{6}$/.test(zip)) { toast.error("Please enter a valid 6-digit pincode"); return false; }
    if (shippingFee === null) { toast.error("Please check delivery availability first"); return false; }
    if (shippingInfo && !shippingInfo.deliverable) { toast.error("We don't deliver to this pincode yet"); return false; }
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
          subtotal: discountedSubtotal,
          shippingFee,
          convenienceFee,
          total: serverTotal ?? total,
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
          paymentToken: data.paymentToken,
        });
      } else if (res.status === 409 && data.code === "TOTAL_MISMATCH" && data.pricing) {
        // The OTP is still valid: show the new total and let the shopper confirm it.
        setServerTotal(data.pricing.total);
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const thumbnail = product.imgs?.thumbnails?.[0] || product.imgs?.previews?.[0];

  // Can proceed only when shipping has been checked and is deliverable
  const canSubmit = shippingFee !== null && shippingInfo?.deliverable && !loading;
  const atStockLimit = product.stockQuantity !== undefined && quantity >= product.stockQuantity;

  return (
    <div className={s.step}>
      {/* Header */}
      <div className={s.stepHead}>
        <button type="button" onClick={onBack} className={s.iconButton} aria-label="Back">
          <ArrowLeft aria-hidden="true" />
        </button>
        <h3>{step === "details" ? "Checkout" : "Enter your code"}</h3>
      </div>

      <div className={s.stepBody}>
        {/* Product summary */}
        <div className={s.summary}>
          <div className={s.photo}>{thumbnail && <img src={thumbnail} alt="" />}</div>
          <div className={s.info}>
            <p className={s.pack}>{packLabel(product)}</p>
            <p className={s.productTitle}>{product.title}</p>
            <div className={s.summaryControls}>
              <div className={s.stepper} role="group" aria-label={`Quantity of ${product.title}`}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Remove one">
                  <Minus aria-hidden="true" />
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => {
                    const maxQty = product.stockQuantity ?? Infinity;
                    if (quantity < maxQty) setQuantity(quantity + 1);
                  }}
                  disabled={atStockLimit}
                  aria-label="Add one"
                >
                  <Plus aria-hidden="true" />
                </button>
              </div>
              {product.stockQuantity !== undefined && product.stockQuantity <= 10 && (
                <span className={s.lowStock}>Only {product.stockQuantity} left</span>
              )}
            </div>
          </div>
          <div className={s.lineTotal}>
            {hasDiscount ? (
              <>
                <s><span className={s.srOnly}>Was </span>{rupees.format(originalSubtotal)}</s>
                <p>{rupees.format(discountedSubtotal)}</p>
                <span>{product.discountPercentage}% off</span>
              </>
            ) : (
              <p>{rupees.format(originalSubtotal)}</p>
            )}
          </div>
        </div>

        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className={s.form}>
            <fieldset className={s.fieldset}>
              <legend className={s.legend}>Contact</legend>
              <div>
                <label htmlFor="chat-checkout-name" className={s.label}>Full name</label>
                <input id="chat-checkout-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={s.textInput} placeholder="John Doe" autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="chat-checkout-email" className={s.label}>Email</label>
                <input id="chat-checkout-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={s.textInput} placeholder="you@email.com" autoComplete="email" required />
              </div>
              <div>
                <label htmlFor="chat-checkout-phone" className={s.label}>Phone</label>
                <input id="chat-checkout-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={s.textInput} placeholder="9876543210" autoComplete="tel-national" inputMode="tel" required />
              </div>
            </fieldset>

            <fieldset className={s.fieldset}>
              <legend className={s.legend}>Delivery address</legend>
              <div>
                <label htmlFor="chat-checkout-street" className={s.label}>Street address</label>
                <input id="chat-checkout-street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={s.textInput} placeholder="Street address" autoComplete="street-address" required />
              </div>
              <div className={s.pair}>
                <div>
                  <label htmlFor="chat-checkout-city" className={s.label}>City</label>
                  <input id="chat-checkout-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={s.textInput} placeholder="City" autoComplete="address-level2" required />
                </div>
                <div>
                  <label htmlFor="chat-checkout-state" className={s.label}>State</label>
                  <input id="chat-checkout-state" type="text" value={state} onChange={(e) => setState(e.target.value)} className={s.textInput} placeholder="State" autoComplete="address-level1" required />
                </div>
              </div>
              <div>
                <label htmlFor="chat-checkout-pin" className={s.label}>PIN code</label>
                <input
                  id="chat-checkout-pin"
                  type="text"
                  value={zip}
                  onChange={(e) => handleZipChange(e.target.value)}
                  className={s.textInput}
                  placeholder="Pincode"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-describedby="chat-checkout-pin-hint"
                  required
                />
                <p id="chat-checkout-pin-hint" className={s.hint}>Fresh mushrooms deliver in Dehradun only. Other packs ship across India.</p>
              </div>
            </fieldset>

            {/* Shipping status — shown after pincode check */}
            <div role="status">
              {zip.length === 6 && (checkingShipping ? (
                <p className={s.status}><Loader2 aria-hidden="true" className={s.spin} />Checking delivery to {zip}…</p>
              ) : shippingInfo?.deliverable ? (
                <div className={s.status} data-tone="ok">
                  <Truck aria-hidden="true" />
                  <div>
                    {shippingInfo.freeShipping
                      ? <span>Free delivery</span>
                      : <span>Delivery {rupees.format(shippingInfo.shippingFee)}</span>}
                    {shippingInfo.estimatedDays && <span> · {shippingInfo.estimatedDays}</span>}
                    {!shippingInfo.freeShipping && shippingInfo.freeAbove && (
                      <small>Free delivery on orders above {rupees.format(shippingInfo.freeAbove)}</small>
                    )}
                  </div>
                </div>
              ) : shippingInfo ? (
                <p className={s.status} data-tone="error"><MapPin aria-hidden="true" />{shippingInfo.message || "We do not deliver to this PIN code yet."}</p>
              ) : null)}
            </div>

            {/* Price breakdown */}
            <dl className={s.totals}>
              <div>
                <dt>Subtotal ({quantity} item{quantity > 1 ? "s" : ""})</dt>
                <dd>{rupees.format(originalSubtotal)}</dd>
              </div>
              {productDiscount > 0 && (
                <div className={s.saving}>
                  <dt>Product discount ({product.discountPercentage}%)</dt>
                  <dd>−{rupees.format(productDiscount)}</dd>
                </div>
              )}
              <div>
                <dt>Delivery</dt>
                <dd>
                  {shippingFee === null
                    ? <span className={s.muted}>Enter PIN code</span>
                    : shippingFee === 0 ? "Free" : rupees.format(shippingFee)}
                </dd>
              </div>
              <div>
                <dt>Convenience fee</dt><dd>{rupees.format(convenienceFee)}</dd>
              </div>
              <div className={s.grand}>
                <dt>Total</dt>
                <dd>{shippingFee === null ? "—" : rupees.format(total)}</dd>
              </div>
            </dl>

            <button type="submit" disabled={!canSubmit} className={s.primary}>
              {loading
                ? <><Loader2 aria-hidden="true" className={s.spin} /> Sending code…</>
                : shippingFee === null
                  ? "Enter a PIN code we deliver to"
                  : "Send verification code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOTPSubmit} className={s.form}>
            <p className={s.notice}>
              We sent a verification code to <strong>{email}</strong>
              {phone && <> and to <strong>{phone}</strong></>}.
            </p>

            <div>
              <label htmlFor="chat-checkout-otp" className={s.label}>Verification code</label>
              <input
                id="chat-checkout-otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`${s.textInput} ${s.otp}`}
                placeholder="• • • • • •"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
              />
            </div>

            <div className={s.split}>
              <button type="button" onClick={() => setStep("details")} className={s.textAction}>
                Change details
              </button>
              <button type="button" onClick={sendOTP} disabled={resendTimer > 0 || loading} className={s.textAction}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
              </button>
            </div>

            {serverTotal !== null && (
              <div role="alert" className={s.alert}>
                The price changed while you were checking out. The total is now <strong>₹{serverTotal.toFixed(2)}</strong> (it was ₹{total.toFixed(2)}). Your code is still valid.
              </div>
            )}

            <button type="submit" disabled={loading || otp.length < 4} className={s.primary}>
              {loading
                ? <><Loader2 aria-hidden="true" className={s.spin} /> Placing order…</>
                : serverTotal !== null ? `Place order for ₹${serverTotal.toFixed(2)}` : "Verify and place order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatCheckout;
