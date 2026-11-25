"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import ProductCard from "../Pantry/ProductCard";
import { deliveryScope, isGrowProduct, productKind } from "../Pantry/catalogue";
import type { Shelf } from "./index";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/decide.module.css";

type Props = { product: Product; category?: Shelf; onNotify: (product: Product) => void };

/**
 * Up to four other packs from the same shelf, in stock first. Hidden when the shelf has no others or fails to load.
 * Growing supplies and food never mix: a spawn page suggests only other grow supplies, and a food page never suggests spawn,
 * even while the catalogue still files spawn under Seeds.
 */
export default function Related({ product, category, onNotify }: Props) {
  const [items, setItems] = useState<Product[]>([]);

  const slug = category?.slug;
  const grow = isGrowProduct(product);
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    fetch(`/api/products?category=${encodeURIComponent(slug)}&limit=12`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
      .then(data => {
        const others: Product[] = (data.products ?? []).filter((item: Product) => item.id !== product.id && item.slug && isGrowProduct(item) === grow);
        setItems([...others.filter(item => item.inStock), ...others.filter(item => !item.inStock)].slice(0, 4));
      })
      .catch(() => { if (!controller.signal.aborted) setItems([]); });
    return () => controller.abort();
  }, [slug, product.id, grow]);

  if (!category || !items.length) return null;

  return <section className={styles.related} aria-labelledby="related-title">
    <div className={styles.relatedHead}>
      <h2 id="related-title">{category.grow ? "More for growing mushrooms" : `More ${category.title.toLowerCase()}`}</h2>
      <Link href={category.href} className={pantry.textAction}>{category.grow ? "See all grow-your-own supplies" : `See all ${category.title.toLowerCase()}`}</Link>
    </div>
    <div className={pantry.products}>
      {items.map(item => <ProductCard key={item.id} product={item} label={productKind(item)} delivery={deliveryScope(item)} titleAs="h3" onNotify={onNotify} />)}
    </div>
  </section>;
}
