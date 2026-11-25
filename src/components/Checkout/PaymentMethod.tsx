import React from "react";
import r from "../Pantry/review.module.css";

interface PaymentMethodProps {
  onPaymentChange?: (method: string) => void;
}

/**
 * UPI is the only payment method. Cash on delivery is switched off; the "bank" value
 * kept for onPaymentChange means UPI.
 */
const PaymentMethod = ({ onPaymentChange }: PaymentMethodProps) => (
  <section className={r.block} aria-labelledby="payment-title">
    <h2 id="payment-title"><span>3</span>Payment</h2>
    <label className={r.choice}>
      <input type="radio" name="payment" value="bank" checked readOnly onChange={() => onPaymentChange?.("bank")} />
      <span><strong>UPI</strong><br />Pay with any UPI app after you verify your email. We confirm the order once we verify the payment.</span>
    </label>
  </section>
);

export default PaymentMethod;
