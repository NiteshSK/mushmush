// Clean Checkout component with OTP verification
"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectTotalPrice, removeAllItemsFromCart, applyServerPrices } from "@/redux/features/cart-slice";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { trackVisitAction } from "@/lib/visit-analytics";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { X } from "lucide-react";

import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import AddressSection, { Address } from "./AddressSection";
import UPIPaymentModal from "@/components/Payment/UPIPaymentModal";
import BagLine from "../Cart/BagLine";
import FreshConflict, { listNames } from "../Cart/FreshConflict";
import { CheckoutSteps, EmptyBag } from "../Cart";
import { rememberedPin, useBag, useBagReady } from "../Cart/bag";
import { useModalDialog } from "../Cart/useModalDialog";
import { rupees } from "../Pantry/catalogue";
import { pinDelivery, undeliverableFreshLines } from "../Pantry/delivery";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

// Address type imported from AddressSection

/** Server breakdown returned with 409 TOTAL_MISMATCH (see src/lib/order-pricing.ts). */
interface ServerPricing {
  items: { productId: number; title: string; quantity: number; listPrice: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  shippingFee: number;
  convenienceFee: number;
  couponDiscount: number;
  total: number;
}

interface PriceChange {
  previousTotal: number;
  total: number;
  lines: { title: string; before: number; after: number }[];
  shipping: { before: number; after: number } | null;
}

/** Shown after the shopper submits UPI details: the payment still needs verification. */
interface PaymentSubmitted {
  orderNumber: string;
  total: number;
  email: string;
  transactionId?: string;
  /** Relative /track link from verify-and-place-order. */
  trackingUrl?: string;
}

const CheckoutWithOTP = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectTotalPrice);
  const ready = useBagReady();
  const { lines, count, catalogueLoading, catalogueError } = useBag();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank"); // Changed to UPI

  // OTP Modal
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [checkoutData, setCheckoutData] = useState<Record<string, unknown> | null>(null);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  // Toasts sit under a modal dialog, so the OTP dialog repeats resend results inline.
  const [otpNotice, setOtpNotice] = useState("");

  // UPI Payment Modal
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [orderCreated, setOrderCreated] = useState<{ id: string; orderNumber: string; total: number; status: string; paymentToken?: string; trackingUrl?: string } | null>(null);
  // Set when the server reports new prices; the shopper confirms with the same OTP.
  const [priceChange, setPriceChange] = useState<PriceChange | null>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState<PaymentSubmitted | null>(null);
  // Set when placing the order fails with 400 UNDELIVERABLE (the server checks fresh delivery too).
  const [undeliverable, setUndeliverable] = useState<string | null>(null);

  // Address management — simplified
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [billToDifferent, setBillToDifferent] = useState(false);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);

  // Contact info
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const userPhone = contactInfo.phone;

  // Dynamic shipping fee based on pincode
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [shippingInfo, setShippingInfo] = useState<{
    deliverable: boolean;
    pincode?: string;
    zoneName?: string;
    freshEligible?: boolean;
    estimatedDays?: string;
    freeAbove?: number | null;
    freeShipping?: boolean;
    message?: string;
  } | null>(null);
  const [shippingPincode, setShippingPincode] = useState('');
  const [checkingShipping, setCheckingShipping] = useState(false);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    couponId: number;
    discountAmount: number;
    message: string;
  } | null>(null);

  const convenienceFee = CONVENIENCE_FEE;
  const couponDiscount = appliedCoupon?.discountAmount ?? 0;
  const productDiscount = cartItems.reduce((sum, item) => {
    if (item.discountedPrice && item.discountedPrice < item.price) {
      return sum + (item.price - item.discountedPrice) * item.quantity;
    }
    return sum;
  }, 0);
  const total = subtotal + (shippingFee ?? 0) + convenienceFee - couponDiscount;

  // Fresh mushrooms deliver only in Dehradun: find fresh lines the checked PIN cannot take.
  const scopes = useMemo(() => new Map(lines.map((line) => [line.id, line.scope] as const)), [lines]);
  const checkedPin = shippingInfo?.pincode ?? "";
  const zone = shippingInfo && checkedPin ? pinDelivery(checkedPin, shippingInfo) : null;
  const blockedLines = zone && zone !== "unavailable" ? undeliverableFreshLines(lines, scopes, zone) : [];
  // After a server refusal, every fresh line is affected unless the page already named them.
  const freshLines = lines.filter((line) => line.scope === "fresh");
  const refused = undeliverable ? freshLines.filter((line) => !blockedLines.includes(line)) : [];
  const blockedIds = new Set(blockedLines.concat(refused).map((line) => line.id));

  const submitRef = useRef<HTMLButtonElement>(null);
  const conflictRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLHeadingElement>(null);
  const refusalRef = useRef<HTMLDivElement>(null);

  // A new PIN or a changed bag answers the server's refusal; check again on the next attempt.
  useEffect(() => { setUndeliverable(null); }, [checkedPin, lines.length]);

  // Fetch saved addresses and user profile on mount
  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
      fetchUserProfile();
    } else {
      setLoadingAddresses(false);
    }
  }, [session]);

  const fetchUserProfile = async () => {
    if (session?.user?.email) {
      try {
        const response = await fetch(`/api/user/profile?email=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setContactInfo({
            firstName: session.user.name?.split(' ')[0] || '',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email || '',
            phone: data.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);

        // Auto-select default address
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a: Address) => a.isDefault) || addresses[0];
          setDeliveryAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Check shipping fee by pincode
  const checkShippingFee = async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) {
      setShippingInfo(null);
      setShippingFee(null);
      return;
    }
    setCheckingShipping(true);
    try {
      const res = await fetch(`/api/shipping/check?pincode=${pincode}&subtotal=${subtotal}`);
      const data = await res.json();
      setShippingInfo(data);
      if (data.deliverable) {
        setShippingFee(data.shippingFee);
      } else {
        setShippingFee(null);
      }
    } catch {
      setShippingInfo(null);
      setShippingFee(null);
    } finally {
      setCheckingShipping(false);
    }
  };

  // Re-check shipping when subtotal changes (for free-shipping thresholds)
  useEffect(() => {
    if (shippingPincode && /^\d{6}$/.test(shippingPincode)) {
      checkShippingFee(shippingPincode);
    }
  }, [subtotal]);

  // Start from the PIN the shopper checked on /cart, until an address supplies one.
  useEffect(() => {
    if (!ready || shippingPincode) return;
    const pin = rememberedPin();
    if (pin) { setShippingPincode(pin); checkShippingFee(pin); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle checkout button click
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Get contact information - prioritize shipping fields if filled
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = (formData.get('email') || formData.get('shippingEmail')) as string;
    const phone = (formData.get('phone') || formData.get('shippingPhone')) as string;

    const customerName = `${firstName || ''} ${lastName || ''}`.trim();

    if (!email) {
      const errorMsg = 'Please enter your email address in Contact Information';
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }

    if (shippingFee === null || !shippingInfo?.deliverable) {
      const errorMsg = 'Please check delivery availability by entering your pincode';
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }

    if (!customerName || customerName === '') {
      const errorMsg = 'Please enter your first and last name in Contact Information';
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }

    if (!phone) {
      const errorMsg = 'Please enter your phone number in Contact Information';
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }

    // Validate delivery address
    if (!deliveryAddress) {
      const errorMsg = 'Please select or enter a delivery address';
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }

    // Build address objects
    const toAddrObj = (addr: Address) => ({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || 'India',
    });

    const shippingAddrData = toAddrObj(deliveryAddress);
    const billingAddrData = billToDifferent && billingAddress
      ? toAddrObj(billingAddress)
      : shippingAddrData;

    const isSavedDelivery = !deliveryAddress.id.startsWith('temp-');
    const isSavedBilling = billToDifferent && billingAddress && !billingAddress.id.startsWith('temp-');

    // Store checkout data for later use
    const storedData = {
      email,
      customerName,
      customerPhone: phone,
      billingAddress: billingAddrData,
      shippingAddress: shippingAddrData,
      billingAddressId: (billToDifferent && isSavedBilling ? billingAddress!.id : isSavedDelivery ? deliveryAddress.id : null),
      shippingAddressId: isSavedDelivery ? deliveryAddress.id : null,
      cartItems,
      subtotal,
      shippingFee,
      convenienceFee,
      total,
      paymentMethod: 'UPI',
      notes,
      couponCode: appliedCoupon?.code || null,
    };

    setCheckoutData(storedData);

    // Step 2: Send OTP for verification
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/checkout/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, customerName, phone })
      });

      const data = await response.json();

      if (response.ok) {
        // The code dialog says where the code went and when it expires. A toast would
        // reappear over the "Pay by UPI" button after the dialogs close.
        trackVisitAction("checkout_code");
        setShowOTPModal(true);
      } else if (response.status === 429) {
        toast.error(data.error || 'Too many OTP requests. Please wait.', { duration: 5000 });
        setError(data.error || 'Too many OTP requests. Please wait.');
        if (data.retryAfter) {
          setResendTimer(data.retryAfter);
        }
      } else {
        setError(data.error || 'Failed to send OTP');
        toast.error(data.error || 'Failed to send OTP', { duration: 4000 });
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Checks the bag against the delivery address before handleCheckout sends a code.
   * The server does not enforce fresh delivery yet, so the page must.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryAddress && /^\d{6}$/.test(deliveryAddress.zip) && deliveryAddress.zip !== shippingPincode) {
      setShippingPincode(deliveryAddress.zip);
      checkShippingFee(deliveryAddress.zip);
      setError(`Your delivery address uses PIN ${deliveryAddress.zip}. We updated the delivery fee for that PIN. Check the total, then continue.`);
      return;
    }
    if (blockedLines.length || refused.length) {
      setError(`Remove ${listNames(blockedLines.concat(refused).map((line) => line.title))} or change the delivery address to continue.`);
      (blockedLines.length ? conflictRef : refusalRef).current?.focus();
      return;
    }
    if (catalogueLoading) {
      setError("We are still checking which items are fresh. Try again in a moment.");
      return;
    }
    handleCheckout(e);
  };

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Start resend timer when OTP modal opens
  useEffect(() => {
    if (showOTPModal) {
      setResendTimer(60);
    }
  }, [showOTPModal]);

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!checkoutData || resendTimer > 0) return;

    setResendingOTP(true);
    setError("");
    setOtpNotice("");

    try {
      const response = await fetch('/api/checkout/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: checkoutData.email,
          customerName: checkoutData.customerName,
          phone: checkoutData.customerPhone
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New OTP sent! Valid for 5 minutes.', { duration: 4000 });
        setOtpNotice('We sent a new code. It expires in 5 minutes.');
        setResendTimer(60);
        setOtp("");
      } else if (response.status === 429) {
        toast.error(data.error || 'Too many OTP requests. Please wait.', { duration: 5000 });
        setOtpNotice(data.error || 'Too many OTP requests. Please wait.');
        if (data.retryAfter) {
          setResendTimer(data.retryAfter);
        }
      } else {
        toast.error(data.error || 'Failed to resend OTP', { duration: 4000 });
        setOtpNotice(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      setOtpNotice('Network error. Please try again.');
    } finally {
      setResendingOTP(false);
    }
  };

  // Handle verify OTP and create order (then show UPI payment modal)
  const handleVerifyAndPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!checkoutData) {
      setError('Checkout data not found. Please try again.');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        ...checkoutData,
        otp
      };

      const response = await fetch('/api/checkout/verify-and-place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowOTPModal(false);
        setOtp("");
        setPriceChange(null);

        setOrderCreated({ ...data.order, paymentToken: data.paymentToken, trackingUrl: data.trackingUrl });
        trackVisitAction("checkout_payment");
        // The UPI dialog and the "Awaiting payment" panel name the order; a toast here
        // would sit over the "Pay by UPI" button on phones.
        setShowUPIModal(true);
      } else if (response.status === 409 && data.code === 'TOTAL_MISMATCH' && data.pricing) {
        // Prices changed after checkout opened. The OTP is still valid: update the
        // bag to the server prices, show what changed, and let the shopper confirm.
        const pricing = data.pricing as ServerPricing;
        const shown = new Map(cartItems.map((item) => [item.id, item.discountedPrice || item.price]));
        const lines = pricing.items
          .filter((line) => shown.has(line.productId) && Math.abs((shown.get(line.productId) as number) - line.unitPrice) > 0.004)
          .map((line) => ({ title: line.title, before: shown.get(line.productId) as number, after: line.unitPrice }));
        const shownShipping = Number(checkoutData.shippingFee ?? 0);
        dispatch(applyServerPrices(pricing.items));
        setShippingFee(pricing.shippingFee);
        setCheckoutData({ ...checkoutData, subtotal: pricing.subtotal, shippingFee: pricing.shippingFee, total: pricing.total });
        setPriceChange({
          previousTotal: Number(checkoutData.total),
          total: pricing.total,
          lines,
          shipping: Math.abs(shownShipping - pricing.shippingFee) > 0.004 ? { before: shownShipping, after: pricing.shippingFee } : null,
        });
      } else if (data.code === 'UNDELIVERABLE') {
        // The server will not deliver this bag to the address PIN. Close the code dialog
        // and show its reason beside the fresh lines, where the shopper can fix it.
        setShowOTPModal(false);
        setOtp("");
        setPriceChange(null);
        setOtpNotice("");
        setUndeliverable(data.error || 'We cannot deliver this order to your PIN.');
      } else {
        if (data.stockErrors && data.stockErrors.length > 0) {
          setError(data.stockErrors.join('. '));
        } else {
          setError(data.error || 'Failed to create order');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeOtp = () => { setShowOTPModal(false); setOtp(""); setError(""); setResendTimer(0); setPriceChange(null); setOtpNotice(""); };

  // Handle UPI payment completion. The payment is submitted, not confirmed:
  // the order stays pending until the team verifies the UPI transaction.
  const handleUPIPaymentComplete = (paymentData: any) => {
    if (orderCreated && checkoutData) {
      trackVisitAction("payment_submitted");
      setPaymentSubmitted({
        orderNumber: orderCreated.orderNumber,
        total: orderCreated.total,
        email: checkoutData.email as string,
        transactionId: paymentData?.payment?.transactionId,
        trackingUrl: orderCreated.trackingUrl,
      });
    }
    dispatch(removeAllItemsFromCart());
    setShowUPIModal(false);
    setCheckoutData(null);
    setOrderCreated(null);
    // The status panel says the payment is submitted and still being verified.
  };

  // Move focus to the status heading when the page changes to an order status.
  useEffect(() => { if (paymentSubmitted) statusRef.current?.focus(); }, [paymentSubmitted]);

  const changeAddress = () => {
    addressRef.current?.scrollIntoView({ block: "start" });
    addressRef.current?.focus();
  };

  const step: 2 | 3 | 4 | 5 = paymentSubmitted ? 5 : orderCreated ? 4 : showOTPModal ? 3 : 2;

  return (
    <main id="main" className={`${p.page} ${r.root}`}>
      <div className={p.pageHead}>
        <div>
          <p className={p.kicker}>Review and pay</p>
          <h1>Place your <em>order.</em></h1>
        </div>
        {!session && !orderCreated && !paymentSubmitted && ready && cartItems.length > 0 && (
          <p className={p.deliveryNote}>
            <span>Check out as a guest, or sign in to use saved addresses and follow this order later.</span>
            <Link href="/auth/signin?callbackUrl=%2Fcheckout" className={p.textAction}>Sign in</Link>
          </p>
        )}
      </div>
      <CheckoutSteps current={step} />

      {paymentSubmitted ? (
        <section className={r.status} aria-labelledby="status-title">
          <span className={r.badge} data-state="verifying">Payment submitted · verifying</span>
          <h2 id="status-title" ref={statusRef} tabIndex={-1}>Thank you. We are checking your payment.</h2>
          <p>We received your UPI transaction details. Order {paymentSubmitted.orderNumber} is confirmed after we verify the payment.</p>
          <dl className={r.facts}>
            <dt>Order</dt><dd>{paymentSubmitted.orderNumber}</dd>
            <dt>Amount</dt><dd data-price>{rupees.format(paymentSubmitted.total)}</dd>
            {paymentSubmitted.transactionId && <><dt>UPI transaction ID</dt><dd>{paymentSubmitted.transactionId}</dd></>}
            <dt>Payment</dt><dd>Pending verification</dd>
            <dt>Email</dt><dd>{paymentSubmitted.email}</dd>
          </dl>
          <div className={r.statusActions}>
            {session ? <Link href="/orders" className={p.primaryAction}>View my orders</Link> : <Link href="/shop" className={p.primaryAction}>Continue shopping</Link>}
            {paymentSubmitted.trackingUrl && <Link href={paymentSubmitted.trackingUrl} className={p.textAction}>Track this order</Link>}
            {session && <Link href="/shop" className={p.textAction}>Continue shopping</Link>}
          </div>
        </section>
      ) : orderCreated ? (
        <section className={r.status} aria-labelledby="status-title">
          <span className={r.badge} data-state="awaiting">Awaiting payment</span>
          <h2 id="status-title" ref={statusRef} tabIndex={-1}>Order <span className={r.num}>{orderCreated.orderNumber}</span> is placed.</h2>
          <p>Pay {rupees.format(orderCreated.total)} by UPI and submit the transaction ID. We have not received a payment for this order yet. Your bag stays saved until you submit the payment details.</p>
          <p>Pay within 48 hours. After that the order is cancelled.</p>
          <dl className={r.facts}>
            <dt>Order</dt><dd>{orderCreated.orderNumber}</dd>
            <dt>Amount due</dt><dd data-price>{rupees.format(orderCreated.total)}</dd>
            <dt>Payment</dt><dd>Not received</dd>
          </dl>
          <div className={r.statusActions}>
            <button id="pay-by-upi" type="button" className={p.primaryAction} onClick={() => setShowUPIModal(true)}>Pay {rupees.format(orderCreated.total)} by UPI</button>
            {orderCreated.trackingUrl && <Link href={orderCreated.trackingUrl} className={p.textAction}>Track this order</Link>}
            <Link href="/contact" className={p.textAction}>Contact us about this order</Link>
          </div>
        </section>
      ) : !ready ? (
        <p className={r.loading} role="status">Opening your bag…</p>
      ) : cartItems.length === 0 ? (
        <EmptyBag />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={r.reviewGrid}>
            {/* ── Details ── */}
            <div>
              <section className={r.block} aria-labelledby="contact-title">
                <h2 id="contact-title"><span>1</span>Contact</h2>
                <p>We send the order code and updates here.</p>
                <div className={r.fields} key={`${session?.user?.email ?? "guest"}-${userPhone}`}>
                  <div className={r.input}>
                    <label htmlFor="firstName">First name</label>
                    <input type="text" name="firstName" id="firstName" required autoComplete="given-name"
                      defaultValue={session?.user?.name?.split(' ')[0] || ''} />
                  </div>
                  <div className={r.input}>
                    <label htmlFor="lastName">Last name</label>
                    <input type="text" name="lastName" id="lastName" required autoComplete="family-name"
                      defaultValue={session?.user?.name?.split(' ').slice(1).join(' ') || ''} />
                  </div>
                  <div className={r.input}>
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" required autoComplete="email" placeholder="you@example.com"
                      defaultValue={session?.user?.email || ''}
                      onChange={(e) => { const email = e.target.value; setContactInfo((prev) => ({ ...prev, email })); }} />
                  </div>
                  <div className={r.input}>
                    <label htmlFor="phone">Mobile number</label>
                    <input type="tel" name="phone" id="phone" required autoComplete="tel-national" inputMode="numeric"
                      defaultValue={userPhone} placeholder="10-digit mobile number" maxLength={10} pattern="[6-9]\d{9}"
                      title="Enter a 10-digit Indian mobile number" />
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <AddressSection
                addresses={savedAddresses}
                selectedId={deliveryAddress?.id || null}
                selected={deliveryAddress}
                onSelect={(addr) => setDeliveryAddress(addr)}
                onPincodeChange={(pin) => { setShippingPincode(pin); checkShippingFee(pin); }}
                isGuest={!session}
                label="Delivery address"
                step={2}
                headingRef={addressRef}
                onAddressesChange={setSavedAddresses}
                loading={loadingAddresses && !!session}
              />

              {/* Bill to different address */}
              <section className={r.block} aria-label="Billing address">
                <label className={r.check}>
                  <input
                    type="checkbox"
                    checked={billToDifferent}
                    onChange={(e) => {
                      setBillToDifferent(e.target.checked);
                      if (!e.target.checked) setBillingAddress(null);
                    }}
                  />
                  Bill to a different address
                </label>

                {billToDifferent && (
                  <AddressSection
                    addresses={savedAddresses}
                    selectedId={billingAddress?.id || null}
                    selected={billingAddress}
                    onSelect={(addr) => setBillingAddress(addr)}
                    onPincodeChange={() => {}}
                    isGuest={!session}
                    label="Billing address"
                    nested
                    onAddressesChange={setSavedAddresses}
                  />
                )}
              </section>

              <PaymentMethod onPaymentChange={setPaymentMethod} />

              {/* Notes */}
              <section className={r.block} aria-labelledby="notes-title">
                <h2 id="notes-title"><span>4</span>Notes</h2>
                <div className={`${r.input} ${r.spaced}`}>
                  <label htmlFor="notes">Delivery instructions <small>(optional)</small></label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="For example, a landmark or a time to call"
                  ></textarea>
                </div>
              </section>
            </div>

            {/* ── Order summary ── */}
            <aside className={r.summary} aria-labelledby="summary-title">
              <div className={r.summaryHead}>
                <h2 id="summary-title">Your order</h2>
                <Link href="/cart" className={p.textAction}>Edit bag</Link>
              </div>
              <ul className={`${r.lines} ${r.compact} ${r.spaced}`}>
                {lines.map((line) => <BagLine key={line.id} line={line} editable={false} blocked={blockedIds.has(line.id)} />)}
              </ul>
              {undeliverable && (
                <FreshConflict ref={refusalRef} pin={checkedPin} delivery={zone ?? "pantry"} lines={refused} serverMessage={undeliverable}
                  change={{ label: "Change the delivery address", onClick: changeAddress }} />
              )}
              {catalogueError && <p className={r.note}>We couldn’t load product details, so fresh items are not marked. Fresh mushrooms deliver only in Dehradun.</p>}

              {/* Pincode Delivery Check */}
              <div className={r.pin}>
                <label htmlFor="delivery-pin">Delivery PIN code</label>
                <div className={p.field}>
                  <input
                    id="delivery-pin"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={shippingPincode}
                    aria-describedby="delivery-pin-result"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setShippingPincode(val);
                      if (val.length === 6) {
                        checkShippingFee(val);
                      } else {
                        setShippingInfo(null);
                        setShippingFee(null);
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); checkShippingFee(shippingPincode); } }}
                    placeholder="6-digit PIN"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => checkShippingFee(shippingPincode)}
                    disabled={shippingPincode.length !== 6 || checkingShipping}
                  >
                    {checkingShipping ? 'Checking…' : 'Check'}
                  </button>
                </div>
                <p id="delivery-pin-result" role="status" className={r.pinResult}
                  data-ok={shippingInfo?.deliverable || undefined} data-error={shippingInfo?.deliverable === false || undefined}>
                  {checkingShipping ? 'Checking delivery…'
                    : shippingInfo?.deliverable ? <>Delivers to {checkedPin}{shippingInfo.estimatedDays ? ` in ${shippingInfo.estimatedDays}` : ''}.{!shippingInfo.freeShipping && shippingInfo.freeAbove ? ` Free delivery above ${rupees.format(shippingInfo.freeAbove)}.` : ''}</>
                    : shippingInfo ? `We don’t deliver to ${checkedPin || shippingPincode} yet. Try another PIN or contact us.`
                    : 'The delivery fee depends on your PIN. Your address PIN fills this in.'}
                </p>
              </div>

              <FreshConflict ref={conflictRef} pin={checkedPin} delivery={zone ?? "pantry"} lines={blockedLines}
                change={{ label: "Change the delivery address", onClick: changeAddress }} />

              <dl className={r.totals}>
                <dt>Subtotal<small>{count} {count === 1 ? "pack" : "packs"}{productDiscount > 0 ? ` · includes ${rupees.format(productDiscount)} off` : ""}</small></dt>
                <dd data-price>{rupees.format(subtotal)}</dd>
                <dt>Delivery{shippingInfo?.deliverable && checkedPin ? <small>To {checkedPin}</small> : null}</dt>
                <dd data-price className={shippingFee === null ? r.pending : undefined} data-testid="delivery-fee">
                  {shippingFee === null ? "Add PIN" : shippingFee === 0 ? "Free" : rupees.format(shippingFee)}
                </dd>
                <dt>Convenience fee</dt>
                <dd data-price>{rupees.format(convenienceFee)}</dd>
                {couponDiscount > 0 && <>
                  <dt className={r.saving}>Coupon {appliedCoupon?.code}</dt>
                  <dd data-price className={r.saving}>−{rupees.format(couponDiscount)}</dd>
                </>}
                <dt className={r.grand}>{shippingFee === null ? "Total before delivery" : "Total"}</dt>
                <dd className={r.grand} data-price data-testid="checkout-total">{rupees.format(total)}</dd>
              </dl>

              <Coupon
                subtotal={subtotal}
                email={contactInfo.email}
                appliedCoupon={appliedCoupon}
                onApply={setAppliedCoupon}
                onRemove={() => setAppliedCoupon(null)}
              />

              {error && <p role="alert" className={r.error}>{error}</p>}

              <button ref={submitRef} type="submit" disabled={loading} className={`${p.primaryAction} ${r.wide}`}>
                {loading ? 'Sending code…' : 'Send verification code'}
              </button>
              <p className={r.note}>
                Next, enter the 6-digit code we email to you. That places the order. Then you pay {shippingFee === null ? "the total" : rupees.format(total)} by UPI.
              </p>
            </aside>
          </div>
        </form>
      )}

      {/* OTP Modal */}
      {showOTPModal && (
        <OtpDialog
          email={checkoutData?.email as string}
          phone={checkoutData?.customerPhone as string}
          otp={otp}
          onOtpChange={setOtp}
          onSubmit={handleVerifyAndPlaceOrder}
          onClose={closeOtp}
          loading={loading}
          error={error}
          notice={otpNotice}
          resendTimer={resendTimer}
          resending={resendingOTP}
          onResend={handleResendOTP}
          priceChange={priceChange}
          returnFocus={() => refusalRef.current ?? submitRef.current}
        />
      )}

      {/* UPI Payment Modal */}
      {showUPIModal && orderCreated && checkoutData && (
        <UPIPaymentModal
          payment={{
            type: "order",
            orderNumber: orderCreated.orderNumber,
            customerName: checkoutData.customerName as string,
            email: checkoutData.email as string,
            // Pay the total stored on the order, not the amount the browser calculated.
            amount: orderCreated.total,
            paymentToken: orderCreated.paymentToken,
          }}
          onClose={() => {
            // Keep the order so the shopper can pay from the "Awaiting payment" panel.
            setShowUPIModal(false);
          }}
          onPaymentComplete={handleUPIPaymentComplete}
          returnFocus={() => document.getElementById("pay-by-upi") ?? statusRef.current}
        />
      )}
    </main>
  );
};

type OtpDialogProps = {
  email: string;
  phone?: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  error: string;
  notice: string;
  resendTimer: number;
  resending: boolean;
  onResend: () => void;
  priceChange: PriceChange | null;
  returnFocus: () => HTMLElement | null;
};

function OtpDialog({ email, phone, otp, onOtpChange, onSubmit, onClose, loading, error, notice, resendTimer, resending, onResend, priceChange, returnFocus }: OtpDialogProps) {
  const dialog = useModalDialog(returnFocus);
  return (
    <dialog ref={dialog} className={`${r.modal} ${r.root}`} aria-labelledby="otp-title" aria-describedby="otp-lead"
      onCancel={(e) => { e.preventDefault(); if (!loading) onClose(); }}>
      <div className={r.modalBody}>
        <h2 id="otp-title">Verify your email</h2>
        <button type="button" className={r.close} onClick={onClose} aria-label="Close verification"><X /></button>
        <p id="otp-lead" className={r.modalLead}>
          Enter the 6-digit code we sent to <strong>{email}</strong>
          {phone && <> and <strong>{phone}</strong></>}. It expires in 5 minutes.
        </p>
        <form onSubmit={onSubmit}>
          <label htmlFor="otp-code" className={p.srOnly}>6-digit code</label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="······"
            maxLength={6}
            className={r.otp}
            data-autofocus
          />

          {/* Resend OTP */}
          <div className={r.resend}>
            {resendTimer > 0 ? (
              <span>You can ask for a new code in {resendTimer}s</span>
            ) : (
              <button type="button" className={p.textAction} onClick={onResend} disabled={resending}>
                {resending ? 'Sending…' : 'Send a new code'}
              </button>
            )}
            <span role="status">{notice}</span>
          </div>

          {priceChange && (
            <div role="alert" className={r.priceChange}>
              <p>Prices changed while you were checking out.</p>
              {priceChange.lines.length > 0 && (
                <ul>
                  {priceChange.lines.map((line) => (
                    <li key={line.title}>
                      {line.title}: <s>{rupees.format(line.before)}</s> → {rupees.format(line.after)} each
                    </li>
                  ))}
                </ul>
              )}
              {priceChange.shipping && (
                <p>
                  Delivery: <s>{rupees.format(priceChange.shipping.before)}</s> → {rupees.format(priceChange.shipping.after)}
                </p>
              )}
              <p>
                New total <strong>{rupees.format(priceChange.total)}</strong> (was {rupees.format(priceChange.previousTotal)}).
                Your code is still valid. Confirm to place the order at the new total.
              </p>
            </div>
          )}

          {error && <p role="alert" className={r.error}>{error}</p>}

          <div className={r.modalActions}>
            <button type="button" className={p.textAction} onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading || otp.length !== 6} className={p.primaryAction}>
              {loading ? 'Verifying…' : priceChange ? `Place order for ${rupees.format(priceChange.total)}` : 'Verify and place order'}
            </button>
          </div>
          <p className={r.safety}>Don’t share this code with anyone. Kosvana will never ask for it.</p>
        </form>
      </div>
    </dialog>
  );
}

export default CheckoutWithOTP;
