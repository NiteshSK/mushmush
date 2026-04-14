"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2, Copy, Smartphone, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import ReactQRCode from "react-qr-code";
import { UPI_CONFIG, generateUPILink } from "@/lib/payment-config";

interface ChatPaymentProps {
  orderNumber: string;
  total: number;
  customerName: string;
  email: string;
  onBack: () => void;
  onPaymentComplete: () => void;
}

const inputClass =
  "w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors";

const ChatPayment: React.FC<ChatPaymentProps> = ({
  orderNumber,
  total,
  customerName,
  email,
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", "UPI");
      formData.append("upiTransactionId", transactionId);
      formData.append("upiId", upiId);
      formData.append("amount", total.toString());
      formData.append("orderNumber", orderNumber);
      formData.append("customerEmail", email);
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
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Payment Submitted!</h3>
          <p className="text-xs text-gray-500 mb-2">Order #{orderNumber}</p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[260px]">
            Your payment is being verified. You&apos;ll receive a confirmation email at <strong>{email}</strong> once verified.
          </p>
          <button
            onClick={onPaymentComplete}
            className="mt-6 bg-forest text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={14} className="text-gray-600" />
        </button>
        <span className="text-xs font-semibold text-gray-800">UPI Payment</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Amount */}
        <div className="text-center bg-forest/5 border border-forest/10 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Pay Amount</p>
          <p className="text-xl font-bold text-forest">₹{total.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Order #{orderNumber}</p>
        </div>

        {/* QR Code */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Scan to Pay</p>
          <div className="flex justify-center py-2">
            <ReactQRCode value={upiLink} size={140} />
          </div>

          {/* UPI ID */}
          <div className="mt-3 bg-gray-50 rounded-lg p-2.5 flex items-center justify-between">
            <div className="text-left min-w-0">
              <p className="text-[10px] text-gray-400">UPI ID</p>
              <p className="text-xs font-mono font-semibold text-gray-800 truncate">{UPI_CONFIG.vpa}</p>
            </div>
            <button onClick={copyUPIId} className="flex-shrink-0 ml-2 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
              <Copy size={12} className="text-gray-500" />
            </button>
          </div>

          {/* Open UPI App */}
          <a
            href={upiLink}
            className="mt-3 flex items-center justify-center gap-1.5 w-full bg-forest text-white py-2 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors"
          >
            <Smartphone size={12} /> Open UPI App
          </a>
        </div>

        {/* Transaction ID form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
            <p className="text-[10px] text-amber-700 leading-relaxed">
              After paying, enter the <strong>transaction ID</strong> from your UPI app below.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Transaction ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className={inputClass}
              placeholder="Enter 12-digit UPI transaction ID"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Your UPI ID <span className="text-gray-300">(optional)</span>
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className={inputClass}
              placeholder="yourname@upi"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Screenshot <span className="text-gray-300">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
              className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-medium file:bg-forest/10 file:text-forest hover:file:bg-forest/20"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <ShieldCheck size={10} /> We never ask for your UPI PIN or OTP.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !transactionId.trim()}
            className="w-full bg-forest text-white py-2.5 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={12} className="animate-spin" /> Submitting...</> : "Submit Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPayment;
