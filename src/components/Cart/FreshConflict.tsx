"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { removeItemFromCart } from "@/redux/features/cart-slice";
import type { PinDelivery } from "../Pantry/delivery";
import type { BagLine } from "./bag";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

export const listNames = (names: string[]) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

type Props = {
  pin: string;
  delivery: PinDelivery;
  /** The fresh lines that cannot go to this PIN. */
  lines: BagLine[];
  /** Label and action that let the shopper pick another address or PIN. */
  change: { label: string; onClick: () => void };
  /** The server's own reason, e.g. a 400 UNDELIVERABLE from placing the order. Shown first. */
  serverMessage?: string;
};

/**
 * Names each fresh line that cannot go to the PIN, and lets the shopper change the
 * address or remove just those lines. The rest of the bag stays as it is.
 */
const FreshConflict = forwardRef<HTMLDivElement, Props>(function FreshConflict({ pin, delivery, lines, change, serverMessage }, ref) {
  const dispatch = useDispatch<AppDispatch>();
  if (!lines.length && !serverMessage) return null;
  const one = lines.length === 1;
  return <div ref={ref} className={r.alert} role="alert" tabIndex={-1} data-testid={serverMessage ? "server-undeliverable" : "fresh-conflict"}>
    {serverMessage && <p><strong>We couldn’t place the order.</strong> {serverMessage}</p>}
    {lines.length > 0 && <><p><strong>{listNames(lines.map(line => line.title))}</strong> {one ? "is a fresh mushroom" : "are fresh mushrooms"}, delivered only in Dehradun.{" "}
      {delivery === "confirm-fresh" ? `The farm has not confirmed fresh delivery to ${pin} yet.` : `We can’t deliver ${one ? "it" : "them"} to ${pin}.`}</p>
    <p>{change.label} or remove {one ? "this item" : "these items"}. The rest of your bag stays as it is.</p></>}
    <div className={r.alertActions}>
      {lines.map(line => <button key={line.id} type="button" className={r.secondaryAction} onClick={() => dispatch(removeItemFromCart(line.id))}>
        Remove {line.title}
      </button>)}
      <button type="button" className={p.textAction} onClick={change.onClick}>{change.label}</button>
      {delivery === "confirm-fresh" && <Link href="/contact" className={p.textAction}>Ask the farm about {pin}</Link>}
    </div>
  </div>;
});

export default FreshConflict;
