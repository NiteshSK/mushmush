"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import ProductCard from "@/components/Pantry/ProductCard";
import { isGrowProduct } from "@/components/Pantry/catalogue";
import styles from "../Pantry/pantry.module.css";

const sections = ["House picks", "Dried mushrooms", "Spices", "Dry fruits", "Seeds"] as const;
type Section = typeof sections[number];
const houseOrder = ["premium-walnuts", "cumin-seeds", "dried-turkey-tail-mushroom", "dried-apricots"];
const categorySections: Record<string, Section> = { spices: "Spices", "dry-fruits": "Dry fruits", seeds: "Seeds" };

function pantrySection(product: Product) {
  if (/dried.*mushroom|mushroom.*dried/i.test(product.title)) return "Dried mushrooms";
  // Spawn and grow bags are growing supplies, not pantry food, even where the catalogue still files them under Seeds.
  if (isGrowProduct(product)) return undefined;
  return product.categories.map(({ category }) => categorySections[category.slug]).find(Boolean);
}

function onShelf(products: Product[], section: Section) {
  if (section !== "House picks") return products.filter(product => pantrySection(product) === section);
  const preferred = houseOrder.flatMap(slug => products.find(product => product.slug === slug) ?? []);
  const rest = products.filter(product => !preferred.includes(product) && pantrySection(product));
  return [...preferred, ...rest].slice(0, 4);
}

export default function PantryShelf() {
  const [section, setSection] = useState<Section>("House picks");
  const { products, loading, error } = useProducts({ limit: 100 });
  const selection = onShelf(products, section);
  return <section id="pantry" className={styles.shelf} aria-labelledby="shelf-title">
    <div className={styles.shelfTop}><div><p className={styles.kicker}>Delivered across India</p>
      <h2 id="shelf-title">The <em>pantry</em> shelf.</h2></div>
      <Link href="/shop" className={styles.shopLink}>Shop all products</Link>
    </div>
    <div className={styles.filters} role="group" aria-label="Filter pantry products">
      {sections.map(name => <button key={name} onClick={() => setSection(name)} aria-pressed={section === name}>{name}</button>)}
    </div>
    {loading ? <div role="status" className={styles.empty}>Opening the pantry…</div> :
      error || !selection.length ? <div className={styles.empty} role="status">{error ? "The pantry shelf couldn’t load." : "This shelf is currently empty."} <Link href="/shop">Visit the full shop</Link></div> :
      <div className={styles.products}>{selection.map(product => <ProductCard key={product.id} product={product} label={pantrySection(product)} />)}</div>}
  </section>;
}
