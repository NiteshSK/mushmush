"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { pinDelivery, undeliverableFreshLines } from "../Pantry/delivery";
import BagLine from "./BagLine";
import FreshConflict from "./FreshConflict";
import OrderSummary from "./OrderSummary";
import { useBag, useBagReady, useDeliveryQuote } from "./bag";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

/** Bag, details, verify email, pay. `current` 5 marks every step done. */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const steps = ["Bag", "Details", "Verify email", "Pay by UPI"];
  return <ol className={r.steps} aria-label="Checkout steps">
    {steps.map((step, index) => <li key={step} aria-current={index + 1 === current ? "step" : undefined} data-done={index + 1 < current || undefined}>
      {step}{index + 1 < current && <span className={p.srOnly}> (done)</span>}
    </li>)}
  </ol>;
}

export function EmptyBag() {
  return <div className={r.empty}>
    <h2>Your bag is empty.</h2>
    <p>Dried mushrooms, spices, dry fruits and seeds ship across India. Fresh mushrooms deliver in Dehradun.</p>
    <Link href="/shop" className={p.primaryAction}>Shop the pantry</Link>
  </div>;
}

export default function Cart() {
  const ready = useBagReady();
  const { lines, subtotal, count, savings, catalogueError, stockIssue } = useBag();
  const delivery = useDeliveryQuote(subtotal);
  const pinRef = useRef<HTMLInputElement>(null);
  const conflictRef = useRef<HTMLDivElement>(null);

  // Start from the PIN the shopper checked earlier in this visit.
  useEffect(() => { if (ready && lines.length) delivery.restore(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const scopes = useMemo(() => new Map(lines.map(line => [line.id, line.scope] as const)), [lines]);
  const zone = delivery.quote && delivery.checkedPin ? pinDelivery(delivery.checkedPin, delivery.quote) : null;
  const blocked = zone && zone !== "unavailable" ? undeliverableFreshLines(lines, scopes, zone) : [];
  const blockedIds = new Set(blocked.map(line => line.id));

  return <main id="main" className={`${p.page} ${r.root}`}>
    <div className={p.pageHead}>
      <div>
        <p className={p.kicker}>Review and pay</p>
        <h1>Your <em>bag.</em></h1>
      </div>
      {ready && count > 0 && <p className={p.deliveryNote}>Pantry goods ship across India. Fresh mushrooms deliver only in Dehradun.</p>}
    </div>
    <CheckoutSteps current={1} />
    {!ready ? <p className={r.loading} role="status">Opening your bag…</p>
      : !lines.length ? <EmptyBag />
      : <div className={r.reviewGrid}>
        <section aria-labelledby="bag-lines-title">
          <h2 id="bag-lines-title" className={p.srOnly}>{count} {count === 1 ? "pack" : "packs"} in your bag</h2>
          <ul className={r.lines} id="bag">
            {lines.map(line => <BagLine key={line.id} line={line} blocked={blockedIds.has(line.id)} />)}
          </ul>
          {catalogueError && <p className={r.note}>We couldn’t load pack sizes and delivery details. Fresh mushrooms deliver only in Dehradun.</p>}
          <Link href="/shop" className={p.textAction}>Continue shopping</Link>
        </section>
        <OrderSummary subtotal={subtotal} count={count} savings={savings} delivery={delivery} pinRef={pinRef} stockIssue={stockIssue}>
          <FreshConflict ref={conflictRef} pin={delivery.checkedPin} delivery={zone ?? "pantry"} lines={blocked}
            change={{ label: "Try another PIN", onClick: () => { pinRef.current?.focus(); pinRef.current?.select(); } }} />
        </OrderSummary>
      </div>}
  </main>;
}
