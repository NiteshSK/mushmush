"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "../Pantry/ProductCard";
import { isGrowProduct, productKind } from "../Pantry/catalogue";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/training.module.css";

export const BULK_SPAWN_HREF = "/contact?subject=Bulk%20spawn";

/**
 * Spawn and grow bags for the people who take the courses.
 * Hidden when the catalogue has none or does not load: the training page must not depend on it.
 */
export default function GrowSection() {
  const { products, loading, error } = useProducts({ limit: 100 });
  const grow = (products ?? []).filter(isGrowProduct);

  if (loading) {
    return (
      <div className={`${styles.grow} ${styles.growLoading}`} aria-hidden="true">
        <div className={styles.growSkeletonCopy}><p /><p /><p /></div>
        <div className={styles.growProducts}>
          {[0, 1].map(key => <div key={key} className={styles.growSkeletonCard}><p /><p /><p /></div>)}
        </div>
      </div>
    );
  }
  if (error || grow.length === 0) return null;

  return (
    <section id="grow" className={styles.grow} aria-labelledby="grow-title">
      <div className={styles.growCopy}>
        <p className={pantry.kicker}>Grow your own</p>
        <h2 id="grow-title">Start growing at home</h2>
        <p>These are supplies for growing mushrooms, not for eating.</p>
        <p>The grow bag is for home growers who want a first harvest. Oyster spawn is for growers and farmers who fill their own bags.</p>
        <Link href={BULK_SPAWN_HREF} className={pantry.textAction}>Buying spawn for a farm? Ask us about bulk orders</Link>
      </div>
      <ul className={styles.growProducts} aria-label="Grow your own supplies">
        {grow.map(product => (
          <li key={product.id}>
            <ProductCard product={product} label={productKind(product)}
              sizes="(max-width: 640px) 46vw, (max-width: 900px) 45vw, 26vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
