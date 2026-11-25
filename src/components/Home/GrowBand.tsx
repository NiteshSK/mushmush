"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import NotifyMeModal from "../NotifyMeModal";
import ProductCard from "../Pantry/ProductCard";
import { isGrowProduct, productKind } from "../Pantry/catalogue";
import styles from "../Pantry/pantry.module.css";

/**
 * "For growers": every spawn and grow bag, in the same shelf layout as the pantry shelf above it.
 * They are not food, so they are not on the pantry shelf. Products only: the grid grows as spawn options are added.
 */
export default function GrowBand() {
  const { products, loading, error } = useProducts({ limit: 100 });
  const growing = useMemo(() => products.filter(isGrowProduct), [products]);
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);

  // A link to /#grow lands before the products load; scroll once the section exists.
  useEffect(() => {
    if (!loading && growing.length && window.location.hash === "#grow") document.getElementById("grow")?.scrollIntoView({ block: "start" });
  }, [loading, growing.length]);

  if (loading || error || !growing.length) return null;
  return <section id="grow" aria-labelledby="grow-title" className={`${styles.shelf} ${styles.growShelf}`}>
    <div className={styles.shelfTop}><div><p className={styles.kicker}>For growers</p>
      <h2 id="grow-title">Grow your <em>own.</em></h2></div>
      <Link href="/contact?subject=Bulk%20spawn" className={styles.shopLink}>Ask about bulk spawn</Link>
    </div>
    <p className={styles.growRule}>Supplies for growing mushrooms. Not for eating.</p>
    <div className={styles.products}>
      {growing.map(product => <ProductCard key={product.id} product={product} label={productKind(product)} onNotify={setNotifyFor} />)}
    </div>
    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </section>;
}
