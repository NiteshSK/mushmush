"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Product } from "@/types/product";
import { useOptionalWishlist } from "@/app/context/WishlistContext";
import NotifyMeModal from "../NotifyMeModal";
import AccountFrame, { useAccountSession } from "../MyAccount/AccountFrame";
import ProductCard from "../Pantry/ProductCard";
import { deliveryScope, productKind } from "../Pantry/catalogue";
import styles from "../Pantry/pantry.module.css";
import a from "../Pantry/account.module.css";

type Load = "loading" | "ready" | "error";

/**
 * Saved products. Each card is the shared pantry card (Add adds slug, stock limit and sale price to the bag);
 * Remove sits beside the card, outside its product link.
 */
export const Wishlist = () => {
  const { status } = useAccountSession("/wishlist");
  const wishlist = useOptionalWishlist();
  const refreshWishlist = () => { wishlist?.refreshWishlist(); };
  const [products, setProducts] = useState<Product[]>([]);
  const [load, setLoad] = useState<Load>("loading");
  const [removed, setRemoved] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);
  const notice = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/wishlist", { cache: "no-store" });
      if (!response.ok) throw new Error(`Wishlist request failed: ${response.status}`);
      const data = await response.json();
      setProducts((data.items ?? []).map((item: { product: Product }) => item.product));
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, []);

  useEffect(() => { if (status === "authenticated") refresh(); }, [status, refresh]);

  // The heart on each card saves and unsaves through the shared wishlist; follow its changes here.
  const savedIds = (wishlist?.items ?? []).map(item => item.productId).sort().join(",");
  const followed = useRef(savedIds);
  useEffect(() => {
    if (followed.current === savedIds) return;
    followed.current = savedIds;
    if (status === "authenticated" && !wishlist?.loading) refresh();
  }, [savedIds, status, wishlist?.loading, refresh]);

  async function remove(product: Product) {
    setProducts(previous => previous.filter(item => item.id !== product.id));
    try {
      const response = await fetch(`/api/wishlist?productId=${product.id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) throw new Error();
      setRemoved(product);
      setMessage(`${product.title} removed from your wishlist.`);
      refreshWishlist();
    } catch {
      setMessage(`We couldn’t remove ${product.title}. Please try again.`);
      setRemoved(null);
      refresh();
    }
    // The card and its Remove button are gone; keep keyboard focus next to the list.
    notice.current?.focus();
  }

  async function undo() {
    if (!removed) return;
    const product = removed;
    setRemoved(null);
    try {
      const response = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
      if (!response.ok) throw new Error();
      setMessage(`${product.title} is back in your wishlist.`);
      await refresh();
      refreshWishlist();
    } catch {
      setMessage(`We couldn’t restore ${product.title}. Please try again.`);
    }
  }

  const count = products.length;
  return <AccountFrame path="/wishlist" title={<>Your <em>wishlist.</em></>}
    aside={load === "ready" && count > 0 && <span>{count} saved {count === 1 ? "product" : "products"}</span>}>
    <div ref={notice} tabIndex={-1} role="status" className={message ? a.notice : undefined}>
      {message && <span>{message}</span>}
      {removed && <button className={styles.textAction} onClick={undo}>Undo</button>}
    </div>
    {load === "loading" ? <div className={styles.products} aria-busy="true" aria-label="Loading your wishlist">
      {Array.from({ length: 4 }, (_, i) => <div key={i} className={styles.skeleton}><div /><p /><p /></div>)}
    </div> : load === "error" ? <div className={styles.recovery} role="alert">
      <h2>Your wishlist couldn’t load.</h2>
      <p>Check your connection and try again.</p>
      <button className={styles.primaryAction} onClick={() => { setLoad("loading"); refresh(); }}>Try again</button>
    </div> : !count ? <div className={styles.recovery}>
      <h2>Your wishlist is empty.</h2>
      <p>Save a product from its page to find it here later. Pantry goods ship across India; fresh mushrooms deliver only in Dehradun.</p>
      <Link href="/shop" className={styles.primaryAction}>Shop the pantry</Link>
    </div> : <ul className={styles.products} aria-label="Saved products">
      {products.map((product, index) => <li key={product.id} className={a.saved}>
        <ProductCard product={product} label={productKind(product)} delivery={deliveryScope(product)} priority={index < 4} onNotify={setNotifyFor} />
        <button className={a.remove} onClick={() => remove(product)} aria-label={`Remove ${product.title} from your wishlist`}><X aria-hidden="true" />Remove</button>
      </li>)}
    </ul>}
    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </AccountFrame>;
};
