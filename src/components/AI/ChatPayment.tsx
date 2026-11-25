"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2, Copy, Smartphone, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import ReactQRCode from "react-qr-code";
import { acceptsRetailProof, RETAIL_PROOF_HINT, RETAIL_PROOF_TYPES } from "@/lib/payment-proof";
import { UPI_CONFIG, generateUPILink } from "@/lib/payment-config";
import { rupees } from "@/components/Pantry/catalogue";
import s from "../Pantry/chat.module.css";

interface ChatPaymentProps {
  orderNumber: string;
  total: number;
  customerName: string;
  email: string;
  /** Returned by verify-and-place-order; proves this browser created the order. */
  paymentToken?: string;
  onBack: () => void;
  onPaymentComplete: () => void;
}

const ChatPayment: React.FC<ChatPaymentProps> = ({
  orderNumber,
  total,
  customerName,
  email,
  paymentToken,
  onBack,
  onPaymentComplete,
}) => {
  const [transactionId, setTransactionId] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const upiLink = generateUPILink({ amount: total, note: `Order ${orderNumber}` });

  const copyUPIId = () => {
    navigator.clipboard.writeText(UPI_CONFIG.vpa);
    toast.success("UPI ID copied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error("Please enter UPI transaction ID");
      return;
    }

    if (paymentProof && !acceptsRetailProof(paymentProof)) {
      toast.error(RETAIL_PROOF_HINT);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", "UPI");
      formData.append("upiTransactionId", transactionId);
      formData.append("upiId", upiId);
      formData.append("amount", total.toString());
      formData.append("orderNumber", orderNumber);
      formData.append("customerEmail", email);
      if (paymentToken) formData.append("paymentToken", paymentToken);
      if (paymentProof) formData.append("paymentProof", paymentProof);

      const res = await fetch("/api/checkout/upi-payment", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "Payment submitted!");
        setSuccess(true);
      } else {
        const err = await res.json();
        toast.error(err.error || "Payment failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={s.step}>
        <div className={s.done} role="status">
          <CheckCircle2 aria-hidden="true" />
          <h3>Payment submitted</h3>
          <p>Order #{orderNumber}</p>
          <p>
            We are checking your UPI payment. We will email <strong>{email}</strong> when the order is confirmed.
          </p>
          <button type="button" onClick={onPaymentComplete} className={s.primary}>
            Back to chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.step}>
      {/* Header */}
      <div className={s.stepHead}>
        <button type="button" onClick={onBack} className={s.iconButton} aria-label="Back to checkout">
          <ArrowLeft aria-hidden="true" />
        </button>
        <h3>Pay by UPI</h3>
      </div>

      <div className={s.stepBody}>
        {/* Amount */}
        <div className={s.amount}>
          <p className={s.kicker}>Amount to pay</p>
          <strong>{rupees.format(total)}</strong>
          <p>Order #{orderNumber}</p>
        </div>

        {/* QR Code */}
        <div className={s.qr}>
          <p className={s.kicker}>Scan to pay</p>
          <div>
            <ReactQRCode value={upiLink} size={156} />
          </div>

          {/* UPI ID */}
          <div className={s.vpa}>
            <div>
              <p>UPI ID</p>
              <p>{UPI_CONFIG.vpa}</p>
            </div>
            <button type="button" onClick={copyUPIId} className={s.copy} aria-label="Copy UPI ID">
              <Copy aria-hidden="true" /> Copy
            </button>
          </div>

          {/* Open UPI App */}
          <a href={upiLink} className={s.secondary}>
            <Smartphone aria-hidden="true" /> Open UPI app
          </a>
        </div>

        {/* Transaction ID form */}
        <form onSubmit={handleSubmit} className={s.form}>
          <p className={s.notice}>
            After you pay, enter the <strong>transaction ID</strong> from your UPI app.
          </p>

          <div>
            <label htmlFor="chat-payment-txn" className={s.label}>UPI transaction ID</label>
            <input
              id="chat-payment-txn"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className={s.textInput}
              placeholder="Enter 12-digit UPI transaction ID"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="chat-payment-vpa" className={s.label}>
              Your UPI ID <span className={s.optional}>(optional)</span>
            </label>
            <input
              id="chat-payment-vpa"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className={s.textInput}
              placeholder="yourname@upi"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="chat-payment-proof" className={s.label}>
              Payment screenshot <span className={s.optional}>(optional)</span>
            </label>
            <input
              id="chat-payment-proof"
              type="file"
              accept={RETAIL_PROOF_TYPES.join(",")}
              aria-describedby="chat-proof-hint"
              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
              className={s.file}
            />
            <small id="chat-proof-hint">{RETAIL_PROOF_HINT}</small>
          </div>

          <p className={s.safety}>
            <ShieldCheck aria-hidden="true" /> We never ask for your UPI PIN or OTP.
          </p>

          <button type="submit" disabled={loading || !transactionId.trim()} className={s.primary}>
            {loading ? <><Loader2 aria-hidden="true" className={s.spin} /> Submitting…</> : "Submit payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPayment;
