"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import ReactQRCode from "react-qr-code";
import { X } from "lucide-react";
import { acceptsRetailProof, RETAIL_PROOF_HINT, RETAIL_PROOF_TYPES } from "@/lib/payment-proof";
import { UPI_CONFIG, generateUPILink } from "@/lib/payment-config";
import { useModalDialog } from "@/components/Cart/useModalDialog";
import { rupees } from "@/components/Pantry/catalogue";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OrderPayment {
  type: "order";
  orderNumber: string;
  customerName: string;
  email: string;
  amount: number;
  /** Returned by verify-and-place-order; proves this browser created the order. */
  paymentToken?: string;
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
  /** Where focus goes when the dialog closes. Defaults to the control that opened it. */
  returnFocus?: () => HTMLElement | null | undefined;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getLabel(payment: PaymentRequest) {
  if (payment.type === "order") {
    return {
      refLabel: "Order",
      refValue: payment.orderNumber,
      nameLabel: "Customer",
      nameValue: payment.customerName,
      note: `Order ${payment.orderNumber}`,
    };
  }
  return {
    refLabel: "Registration",
    refValue: payment.registrationNumber,
    nameLabel: "Participant",
    nameValue: payment.participantName,
    note: `Training ${payment.registrationNumber}`,
  };
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

/**
 * UPI payment for an order or a training registration. Submitting sends the
 * transaction ID for verification; it does not confirm the payment.
 */
const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  payment,
  onClose,
  onPaymentComplete,
  returnFocus,
}) => {
  const [upiId, setUpiId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // Toasts sit under a modal dialog, so errors also show inside it.
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const dialog = useModalDialog(returnFocus);

  const labels = getLabel(payment);
  const upiLink = generateUPILink({ amount: payment.amount, note: labels.note });
  const amount = rupees.format(payment.amount);

  const copyUPIId = () => {
    navigator.clipboard?.writeText(UPI_CONFIG.vpa).then(() => setCopied(true), () => setCopied(false));
    toast.success("UPI ID copied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error("Please enter the UPI transaction ID");
      setError("Please enter the UPI transaction ID");
      return;
    }

    if (payment.type === "order" && paymentProof && !acceptsRetailProof(paymentProof)) {
      setError(RETAIL_PROOF_HINT);
      return;
    }
    setLoading(true);
    setError("");

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
        if (payment.paymentToken) formData.append("paymentToken", payment.paymentToken);
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
        // Checkout shows its own "payment submitted, verifying" panel; training relies on this toast.
        if (payment.type === "training") {
          toast.success(
            data.message || "Payment submitted successfully!"
          );
        }
        onPaymentComplete(data);
        onClose();
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to process payment");
        setError(err.error || "Failed to process payment");
      }
    } catch {
      toast.error("Error processing payment");
      setError("Error processing payment. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog ref={dialog} className={`${r.modal} ${r.root}`} aria-labelledby="upi-title" aria-describedby="upi-lead"
      onCancel={(e) => { e.preventDefault(); if (!loading) onClose(); }}>
      <div className={r.modalBody}>
        <h2 id="upi-title">Pay <span className={r.num}>{amount}</span> by UPI</h2>
        <button type="button" className={r.close} onClick={onClose} aria-label="Close payment" disabled={loading}><X /></button>
        <p id="upi-lead" className={r.modalLead}>
          {labels.refLabel} <strong>{labels.refValue}</strong>{payment.type === "training" && <> for {payment.programName}</>} is waiting for payment.
          {" "}We confirm it after we verify your UPI transaction.
        </p>

        <div className={r.amount}>
          <span>Amount to pay · {labels.nameLabel} {labels.nameValue}</span>
          <strong data-price>{amount}</strong>
        </div>

        <ol className={r.payOrder}>
          <li>Pay exactly {amount} to the UPI ID below. Scan the QR code or open your UPI app.</li>
          <li>Copy the transaction ID (UTR) from your UPI app.</li>
          <li>Enter it below and submit. Keep your UPI PIN private.</li>
        </ol>

        <div className={r.payTo}>
          <div className={r.qr}>
            <ReactQRCode value={upiLink} size={144} title={`UPI QR code to pay ${amount}`} />
          </div>
          <div className={r.vpa}>
            <code>{UPI_CONFIG.vpa}</code>
            <p>{UPI_CONFIG.merchantName}</p>
            <div className={r.formActions}>
              <a href={upiLink} className={r.secondaryAction}>Open UPI app</a>
              <button type="button" onClick={copyUPIId} className={p.textAction}>{copied ? "UPI ID copied" : "Copy UPI ID"}</button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={r.fields}>
            <div className={`${r.input} ${r.full}`}>
              <label htmlFor="upi-transaction">UPI transaction ID</label>
              <input
                id="upi-transaction"
                type="text"
                value={transactionId}
                onChange={(e) => { setTransactionId(e.target.value); setError(""); }}
                inputMode="numeric"
                autoComplete="off"
                aria-describedby="upi-transaction-hint"
                required
                data-autofocus
              />
              <p id="upi-transaction-hint" className={r.hint}>Usually 12 digits. Your UPI app shows it after the payment.</p>
            </div>
            <div className={`${r.input} ${r.full}`}>
              <label htmlFor="upi-id">Your UPI ID <small>(optional)</small></label>
              <input
                id="upi-id"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                autoComplete="off"
                placeholder="name@bank"
              />
            </div>
            <div className={`${r.input} ${r.full}`}>
              <label htmlFor="upi-proof">Screenshot <small>(optional)</small></label>
              <input
                id="upi-proof"
                type="file"
                accept={payment.type === "order" ? RETAIL_PROOF_TYPES.join(",") : "image/*"}
                aria-describedby={payment.type === "order" ? "upi-proof-hint" : undefined}
                className={r.file}
                onChange={(e) => { setPaymentProof(e.target.files?.[0] || null); setError(""); }}
              />
              {payment.type === "order" && <p id="upi-proof-hint" className={r.hint}>{RETAIL_PROOF_HINT}</p>}
            </div>
          </div>

          {error && <p role="alert" className={r.error}>{error}</p>}

          <div className={r.modalActions}>
            <button type="button" onClick={onClose} className={p.textAction} disabled={loading}>
              {payment.type === "order" ? "Pay later" : "Close"}
            </button>
            <button type="submit" disabled={loading} className={p.primaryAction}>
              {loading ? "Submitting…" : "Submit payment details"}
            </button>
          </div>
          <p className={r.safety}>We never ask for your UPI PIN or OTP. Share only the transaction ID here.</p>
        </form>
      </div>
    </dialog>
  );
};

export default UPIPaymentModal;
