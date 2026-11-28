"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { rupees } from "../Pantry/catalogue";
import BagLine from "./BagLine";
import { useBag } from "./bag";
import { useModalDialog } from "./useModalDialog";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

/**
 * Quick review of the bag from the pantry masthead, so shoppers keep their place on a
 * shelf or search. /cart stays the full review page and the link's fallback.
 */
export default function BagDrawer({ onClose }: { onClose: () => void }) {
  const dialog = useModalDialog();
  const { lines, subtotal, count, stockIssue } = useBag();

  return <dialog ref={dialog} className={`${r.drawer} ${r.root}`} aria-labelledby="bag-drawer-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={r.drawerPanel}>
      <div className={r.drawerHead}>
        <h2 id="bag-drawer-title">Your bag</h2>
        <p>{count ? `${count} ${count === 1 ? "pack" : "packs"}` : "Nothing here yet"}</p>
        <button type="button" className={r.close} onClick={onClose} aria-label="Close bag" data-autofocus><X /></button>
      </div>
      {lines.length ? <>
        <div className={r.drawerBody}>
          <ul className={`${r.lines} ${r.compact}`}>
            {lines.map(line => <BagLine key={line.id} line={line} onNavigate={onClose} />)}
          </ul>
        </div>
        <div className={r.drawerFoot}>
          <dl className={r.totals}>
            <dt>Subtotal</dt><dd data-price>{rupees.format(subtotal)}</dd>
            <dt>Convenience fee</dt><dd data-price>{rupees.format(CONVENIENCE_FEE)}</dd>
            <dt>Delivery<small>From your PIN at checkout</small></dt><dd className={r.pending}>Next step</dd>
          </dl>
          {stockIssue ? <p className={r.stockNote} role="status">{stockIssue}</p>
            : <Link href="/checkout" className={`${p.primaryAction} ${r.wide}`} onClick={onClose}>Go to checkout</Link>}
          <div className={r.drawerLinks}><Link href="/cart" className={p.textAction} onClick={onClose}>Review bag and delivery</Link></div>
        </div>
      </> : <div className={r.drawerBody}>
        <div className={r.empty}>
          <h2>Your bag is empty.</h2>
          <p>Dried mushrooms, spices, dry fruits and seeds ship across India.</p>
          <Link href="/shop" className={p.primaryAction} onClick={onClose}>Shop the pantry</Link>
        </div>
      </div>}
    </div>
  </dialog>;
}
