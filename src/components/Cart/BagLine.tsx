"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Minus, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { removeItemFromCart, updateCartItemQuantity } from "@/redux/features/cart-slice";
import { rupees } from "../Pantry/catalogue";
import type { BagLine as Line } from "./bag";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

type Props = {
  line: Line;
  /** Show the quantity stepper and Remove. The checkout summary shows quantities only. */
  editable?: boolean;
  /** Marks a fresh line that cannot go to the delivery PIN. */
  blocked?: boolean;
  /** Called after a link inside the line is followed, e.g. to close the drawer. */
  onNavigate?: () => void;
};

export function DeliveryTag({ scope }: { scope: Line["scope"] }) {
  if (!scope) return null;
  return <p className={p.delivery} data-scope={scope}>
    {scope === "fresh" ? <><MapPin aria-hidden="true" />Fresh · Dehradun only</> : "Ships across India"}
  </p>;
}

export default function BagLine({ line, editable = true, blocked, onNavigate }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [imageFailed, setImageFailed] = useState(false);
  const { id, title, quantity, max } = line;
  const atMax = max === null || quantity >= max;
  const over = max !== null && quantity > max;
  const name = line.href ? <Link href={line.href} onClick={onNavigate}>{title}</Link> : title;

  return <li className={r.line} data-blocked={blocked || undefined} data-testid={`bag-line-${line.slug ?? id}`}>
    <div className={r.lineImage}>
      {line.image && !imageFailed && <Image src={line.image} alt="" fill sizes="88px" onError={() => setImageFailed(true)} />}
    </div>
    <div className={r.lineInfo}>
      <h3>{name}</h3>
      <p className={r.lineMeta}>
        {line.pack && <><span>{line.pack}</span><span aria-hidden="true">·</span></>}
        <span data-price>{rupees.format(line.unitPrice)} each</span>
        {line.unitPrice < line.price && <s><span className={p.srOnly}>was </span>{rupees.format(line.price)}</s>}
        {!editable && <><span aria-hidden="true">·</span><span>Qty {quantity}</span></>}
      </p>
      <DeliveryTag scope={line.scope} />
      {line.soldOut ? <p className={r.stockNote}>Sold out. Remove it to continue.</p>
        : over ? <p className={r.stockNote}>Only {max} left. Reduce the quantity to {max}.</p>
        : max !== null && max <= 10 ? <p className={r.stockNote}>Only {max} left</p> : null}
    </div>
    <p className={r.lineTotal} data-price><span className={p.srOnly}>Line total </span>{rupees.format(line.lineTotal)}</p>
    {editable && <div className={r.lineControls}>
      <div className={`${p.stepper} ${r.qty}`} role="group" aria-label={`Quantity of ${title}`}>
        <button type="button" onClick={() => quantity <= 1 ? dispatch(removeItemFromCart(id)) : dispatch(updateCartItemQuantity({
          id, quantity: quantity - 1, stockQuantity: max ?? undefined,
        }))}
          aria-label={`Remove one ${title}`}><Minus /></button>
        <span aria-live="polite" aria-label={`${quantity} in bag`}>{quantity}</span>
        <button type="button" onClick={() => !atMax && dispatch(updateCartItemQuantity({
          id, quantity: quantity + 1, stockQuantity: max ?? undefined,
        }))} disabled={atMax}
          aria-label={max === null ? `${title}: stock not verified` : atMax ? `${title}: no more in stock` : `Add one ${title}`}><Plus /></button>
      </div>
      <button type="button" className={r.remove} onClick={() => dispatch(removeItemFromCart(id))} aria-label={`Remove ${title} from bag`}>Remove</button>
    </div>}
  </li>;
}
