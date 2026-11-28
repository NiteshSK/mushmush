"use client";

import type { ReactNode, RefObject } from "react";
import Link from "next/link";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { rupees } from "../Pantry/catalogue";
import type { useDeliveryQuote } from "./bag";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

type Props = {
  subtotal: number;
  count: number;
  savings: number;
  delivery: ReturnType<typeof useDeliveryQuote>;
  pinRef?: RefObject<HTMLInputElement>;
  stockIssue?: string | null;
  /** Problems the shopper can fix before checkout, such as a fresh line outside Dehradun. */
  children?: ReactNode;
};

/** The /cart summary: every fee before checkout, a delivery PIN check and one primary action. */
export default function OrderSummary({ subtotal, count, savings, delivery, pinRef, stockIssue, children }: Props) {
  const { pin, edit, check, checkedPin, quote, checking, failed } = delivery;
  const fee = quote?.deliverable ? quote.shippingFee ?? 0 : null;
  const total = subtotal + CONVENIENCE_FEE + (fee ?? 0);

  return <aside className={r.summary} aria-labelledby="summary-title">
    <h2 id="summary-title">Order summary</h2>
    <form className={r.pin} onSubmit={event => { event.preventDefault(); check(); }}>
      <label htmlFor="bag-pin">Delivery PIN code</label>
      <div className={p.field}>
        <input ref={pinRef} id="bag-pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="6-digit PIN" value={pin}
          pattern="[1-9][0-9]{5}" title="Enter a six-digit Indian PIN code" aria-describedby="bag-pin-result" onChange={event => edit(event.target.value)} />
        <button disabled={checking || pin.length !== 6}>{checking ? "Checking…" : "Check"}</button>
      </div>
      <p id="bag-pin-result" role="status" className={r.pinResult} data-ok={quote?.deliverable || undefined} data-error={failed || quote?.deliverable === false || undefined}>
        {failed ? "We couldn’t check this PIN. Please try again."
          : quote && !quote.deliverable ? `We don’t deliver to ${checkedPin} yet. Try another PIN or contact us.`
          : quote ? `Delivers to ${checkedPin}${quote.estimatedDays ? ` in ${quote.estimatedDays}` : ""}.`
          : "Add your PIN to see the delivery fee."}
      </p>
    </form>
    {children}
    <dl className={r.totals}>
      <dt>Subtotal<small>{count} {count === 1 ? "pack" : "packs"}{savings > 0 ? ` · includes ${rupees.format(savings)} off` : ""}</small></dt>
      <dd data-price>{rupees.format(subtotal)}</dd>
      <dt>Delivery{quote?.deliverable && !quote.freeShipping && quote.freeAbove ? <small>Free above {rupees.format(quote.freeAbove)}</small> : null}</dt>
      <dd data-price className={fee === null ? r.pending : undefined}>{fee === null ? "Add PIN" : fee === 0 ? "Free" : rupees.format(fee)}</dd>
      <dt>Convenience fee</dt>
      <dd data-price>{rupees.format(CONVENIENCE_FEE)}</dd>
      <dt className={r.grand}>{fee === null ? "Total before delivery" : "Total"}</dt>
      <dd className={r.grand} data-price data-testid="bag-total">{rupees.format(total)}</dd>
    </dl>
    {stockIssue ? <p className={r.stockNote} role="status">{stockIssue}</p>
      : <Link href="/checkout" className={`${p.primaryAction} ${r.wide}`}>Go to checkout</Link>}
    <p className={r.note}>Next, add your contact details and address. We email you a code to confirm the order, then you pay by UPI. Coupons apply at checkout.</p>
  </aside>;
}
