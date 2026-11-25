"use client";

import { pinDelivery } from "./delivery";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import styles from "./pantry.module.css";

export type Panel = "search" | "menu" | "delivery";
type Delivery = { message: string; local?: boolean; pantry?: boolean; confirmFresh?: boolean; terms?: string };

/** "Delivery ₹80 · 3-5 days" from the shipping check, when the service returns them. */
function deliveryTerms(zone: { shippingFee?: number; freeShipping?: boolean; estimatedDays?: string | null }) {
  const fee = zone.freeShipping || zone.shippingFee === 0 ? "Free delivery" : typeof zone.shippingFee === "number" ? `Delivery ₹${zone.shippingFee.toLocaleString("en-IN")}` : null;
  return [fee, zone.estimatedDays].filter(Boolean).join(" · ") || undefined;
}

type Props = {
  panel: Panel; onClose: () => void; browseHref?: string;
  /** The menu starts with sign-in links for signed-out shoppers. */
  signedIn?: boolean; signInHref?: string;
};

export default function PantryDialog({ panel, onClose, browseHref, signedIn = false, signInHref = "/auth/signin" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController | null>(null);
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    // React's autoFocus runs before showModal() opens the dialog, so focus the first field once it is open.
    element?.querySelector<HTMLInputElement>("input")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      request.current?.abort();
      element?.close();
      document.body.style.overflow = previous;
      // Return focus to the control that opened the dialog.
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  async function checkPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setChecking(true);
    setDelivery(null);
    try {
      const response = await fetch(`/api/shipping/check?pincode=${encodeURIComponent(pin)}`, { signal: controller.signal });
      if (!response.ok) throw new Error();
      const zone = await response.json();
      if (controller.signal.aborted) return;
      if (!zone.deliverable) {
        setDelivery({ message: `Delivery is unavailable at ${pin}. Try another PIN or contact us.` });
      } else if (pinDelivery(pin, zone) === "fresh") {
        setDelivery({ local: true, pantry: true, terms: deliveryTerms(zone), message: `We deliver fresh mushrooms and pantry goods to ${pin}.` });
      } else if (pinDelivery(pin, zone) === "confirm-fresh") {
        // The configured zone covers a wider area than Dehradun. Confirm edge addresses with the farm.
        setDelivery({ pantry: true, confirmFresh: true, terms: deliveryTerms(zone), message: `We deliver pantry goods to ${pin}. For fresh mushrooms, the farm can confirm whether your address is within its Dehradun delivery area.` });
      } else {
        setDelivery({ pantry: true, terms: deliveryTerms(zone), message: `We deliver dried mushrooms and all other pantry goods to ${pin}. Fresh mushrooms are available only in Dehradun.` });
      }
    } catch {
      if (!controller.signal.aborted) setDelivery({ message: "We couldn’t check this PIN. Please try again." });
    } finally {
      if (!controller.signal.aborted) setChecking(false);
    }
  }

  return (
    <dialog className={styles.dialog} ref={dialog} aria-labelledby="panel-title" onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.panel}>
        <h2 id="panel-title">{panel === "menu" ? "Explore Kosvana" : panel === "search" ? "Search the pantry" : "Delivery to your door"}</h2>
        <button className={styles.close} onClick={onClose} aria-label="Close dialog"><X /></button>
        {panel === "menu" && <>
          {!signedIn && <div className={styles.menuAccount}>
            <Link href={signInHref} className={styles.primaryAction}>Sign in</Link>
            <Link href="/auth/signup">Create account</Link>
          </div>}
          <nav aria-label="Browse Kosvana">
            <Link href="/shop">Shop all products</Link><Link href="/training">Training courses</Link><Link href="/about-us">Our story</Link>{signedIn && <Link href="/account">My account</Link>}<Link href="/contact">Contact</Link>
          </nav>
        </>}
        {panel === "search" && <form action="/search" role="search" onSubmit={(event) => {
          const field = event.currentTarget.elements.namedItem("search") as HTMLInputElement;
          field.value = field.value.trim();
          if (!field.value) { event.preventDefault(); field.reportValidity(); }
        }}>
          <label htmlFor="pantry-search">Product or ingredient</label>
          <div className={styles.field}><input autoFocus id="pantry-search" type="search" name="search" required placeholder="Try walnuts or cumin" /><button>Search</button></div>
        </form>}
        {panel === "delivery" && <>
          <p>Dried mushrooms, spices, dry fruits and seeds ship across India. Our fresh mushroom harvest is available in Dehradun.</p>
          <form onSubmit={checkPin}><label htmlFor="pantry-pin">Delivery PIN code</label>
            <div className={styles.field}><input id="pantry-pin" autoFocus inputMode="numeric" autoComplete="postal-code" required pattern="[1-9][0-9]{5}" title="Enter a six-digit Indian PIN code" maxLength={6} placeholder="6-digit PIN" value={pin}
              onChange={event => { request.current?.abort(); setPin(event.target.value); setChecking(false); setDelivery(null); }} />
              <button disabled={checking}>{checking ? "Checking…" : "Check"}</button></div>
          </form>
          <div role="status" className={styles.pinResult}>
            {delivery && <><p>{delivery.message}</p>{delivery.terms && <p className={styles.pinTerms}>{delivery.terms}</p>}
              {delivery.local ? <Link href="/shop-details/king-oyster-eryngii">View fresh King Oyster mushrooms</Link> :
                delivery.confirmFresh ? <Link href="/contact">Check fresh delivery with the farm</Link> :
                delivery.pantry ? (browseHref ? <a href={browseHref} onClick={onClose}>Browse the pantry</a> : <button className={styles.storyLink} onClick={onClose}>Continue shopping</button>) : <Link href="/contact">Contact Kosvana</Link>}</>}
          </div>
        </>}
      </div>
    </dialog>
  );
}
