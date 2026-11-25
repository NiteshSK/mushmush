"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import NotifyMeModal from "../NotifyMeModal";
import AccountFrame, { useAccountSession } from "../MyAccount/AccountFrame";
import ProductCard from "../Pantry/ProductCard";
import { deliveryScope, productKind } from "../Pantry/catalogue";
import styles from "../Pantry/pantry.module.css";

type Load = "loading" | "ready" | "error";

/**
 * The shopper's last five product views. /api/recently-viewed returns raw catalogue rows, so each one
 * takes its sale price and pack stock from the shop listing before it reaches the pantry card and the bag.
 */
export default function RecentlyViewed() {
  const { status } = useAccountSession("/recently-viewed");
  const catalogue = useProducts({ limit: 100 });
  const [viewed, setViewed] = useState<Product[]>([]);
  const [load, setLoad] = useState<Load>("loading");
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/recently-viewed", { cache: "no-store" });
      if (!response.ok) throw new Error(`Recently viewed request failed: ${response.status}`);
      const data = await response.json();
      setViewed((data.items ?? []).map((item: { product: Product }) => item.product));
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, []);

  useEffect(() => { if (status === "authenticated") refresh(); }, [status, refresh]);

  const products = useMemo(() => viewed.map(product => {
    const listed = catalogue.products.find(item => item.id === product.id) as Product | undefined;
    return listed ?? product;
  }), [viewed, catalogue.products]);

  // Wait for listing prices so a card never shows a full price that the listing discounts.
  const loading = load === "loading" || (catalogue.loading && viewed.length > 0);

  return <AccountFrame path="/recently-viewed" title={<>Recently <em>viewed.</em></>}
    aside={!loading && load === "ready" && products.length > 0 && <span>Your last {products.length === 1 ? "product" : `${products.length} products`}</span>}>
    {loading ? <div className={styles.products} aria-busy="true" aria-label="Loading recently viewed products">
      {Array.from({ length: 4 }, (_, i) => <div key={i} className={styles.skeleton}><div /><p /><p /></div>)}
    </div> : load === "error" ? <div className={styles.recovery} role="alert">
      <h2>Recently viewed products couldn’t load.</h2>
      <p>Check your connection and try again.</p>
      <button className={styles.primaryAction} onClick={() => { setLoad("loading"); refresh(); }}>Try again</button>
    </div> : !products.length ? <div className={styles.recovery}>
      <h2>Nothing viewed yet.</h2>
      <p>The products you open while signed in appear here, up to your last five.</p>
      <Link href="/shop" className={styles.primaryAction}>Shop the pantry</Link>
    </div> : <ul className={styles.products} aria-label="Recently viewed products">
      {products.map((product, index) => <li key={product.id} className={styles.card}>
        <ProductCard product={product} label={productKind(product)} delivery={deliveryScope(product)} priority={index < 4} onNotify={setNotifyFor} />
      </li>)}
    </ul>}
    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </AccountFrame>;
}
