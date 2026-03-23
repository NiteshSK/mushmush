"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import ReactQRCode from "react-qr-code";
import { UPI_CONFIG, generateUPILink } from "@/lib/payment-config";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OrderPayment {
  type: "order";
  orderNumber: string;
  customerName: string;
  email: string;
  amount: number;
}

interface TrainingPayment {
  type: "training";
  registrationId: string;
  registrationNumber: string;
  participantName: string;
  programName: string;
  amount: number;
}

export type PaymentRequest = OrderPayment | TrainingPayment;

interface UPIPaymentModalProps {
  payment: PaymentRequest;
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getLabel(payment: PaymentRequest) {
  if (payment.type === "order") {
    return {
      title: "Complete UPI Payment",
      refLabel: "Order #",
      refValue: payment.orderNumber,
      nameLabel: "Customer",
      nameValue: payment.customerName,
      note: `Order ${payment.orderNumber}`,
    };
  }
  return {
    title: "Complete Payment",
    refLabel: "Registration #",
    refValue: payment.registrationNumber,
    nameLabel: "Participant",
    nameValue: payment.participantName,
    note: `Training ${payment.registrationNumber}`,
  };
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  payment,
  onClose,
  onPaymentComplete,
}) => {
  const [upiId, setUpiId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const labels = getLabel(payment);
  const upiLink = generateUPILink({ amount: payment.amount, note: labels.note });

  const copyUPIId = () => {
    navigator.clipboard.writeText(UPI_CONFIG.vpa);
    toast.success("UPI ID copied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error("Please enter the UPI transaction ID");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("paymentMethod", "UPI");
      formData.append("upiTransactionId", transactionId);
      formData.append("upiId", upiId);
      formData.append("amount", payment.amount.toString());

      if (paymentProof) {
        formData.append("paymentProof", paymentProof);
      }

      let endpoint: string;

      if (payment.type === "order") {
        formData.append("orderNumber", payment.orderNumber);
        formData.append("customerEmail", payment.email);
        endpoint = "/api/checkout/upi-payment";
      } else {
        formData.append("registrationId", payment.registrationId);
        endpoint = "/api/training-payments";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          data.message || "Payment submitted successfully!"
        );
        onPaymentComplete(data);
        onClose();
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to process payment");
      }
    } catch {
      toast.error("Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-medium text-xl text-dark">{labels.title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Summary */}
          <div className="bg-forest/5 border border-forest/15 rounded-xl p-4 mb-6">
            <div className="text-sm space-y-1.5 text-gray-600">
              <p>
                <span className="text-gray-400">{labels.refLabel}:</span>{" "}
                <span className="text-dark font-medium">{labels.refValue}</span>
              </p>
              <p>
                <span className="text-gray-400">{labels.nameLabel}:</span>{" "}
                <span className="text-dark">{labels.nameValue}</span>
              </p>
              {payment.type === "training" && (
                <p>
                  <span className="text-gray-400">Program:</span>{" "}
                  <span className="text-dark">{payment.programName}</span>
                </p>
              )}
              <p className="text-lg font-semibold text-dark pt-1">
                Amount: <span className="text-forest">Rs {payment.amount.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* QR + UPI Info */}
          <div className="border border-gray-200 rounded-xl p-5 mb-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">
              Pay to
            </p>
            <div className="bg-forest/5 rounded-lg p-3 mb-4">
              <p className="font-mono text-sm font-semibold text-dark break-all">{UPI_CONFIG.vpa}</p>
              <p className="text-xs text-gray-400 mt-0.5">{UPI_CONFIG.merchantName}</p>
              <button
                onClick={copyUPIId}
                className="mt-2 text-xs text-forest hover:text-dark transition-colors"
              >
                Copy UPI ID
              </button>
            </div>

            {/* QR Code */}
            <div className="flex justify-center py-3">
              <ReactQRCode value={upiLink} size={180} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Scan with any UPI app</p>

            {/* Pay with app button (mobile) */}
            <a
              href={upiLink}
              className="mt-4 inline-flex items-center justify-center gap-2 w-full bg-forest text-white py-3 rounded-full text-sm font-medium hover:bg-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              Open UPI App
            </a>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-amber-800 mb-2">Instructions</p>
            <ol className="list-decimal list-inside text-xs text-amber-700 space-y-1">
              <li>Pay exactly Rs {payment.amount.toLocaleString()} to the UPI ID above</li>
              <li>Save the transaction ID after payment</li>
              <li>Enter the transaction ID below and submit</li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Your UPI ID <span className="normal-case tracking-normal text-gray-300">(optional)</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                placeholder="yourname@upi"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                UPI Transaction ID <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                placeholder="Enter 12-digit transaction ID"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Find this in your UPI app after successful payment
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Payment Screenshot <span className="normal-case tracking-normal text-gray-300">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-forest/10 file:text-forest hover:file:bg-forest/20 transition-colors"
              />
            </div>

            {/* Security notice */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">
                We will never ask for your UPI PIN or OTP. Only share your transaction ID through this form.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-forest text-white py-3 rounded-full text-sm font-medium hover:bg-dark transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentModal;
