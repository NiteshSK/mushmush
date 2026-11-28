"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import NotifyMeModal from "../NotifyMeModal";
import ProductCard from "../Pantry/ProductCard";
import { useOpenPanel } from "../Pantry/PantryShell";
import { isFreshMushroom, productKind } from "../Pantry/catalogue";
import CollectionLinks from "./CollectionLinks";
import { collectionProducts, findCollection } from "./collections";
import { readShopQuery, sortProducts, sorts, type Sort } from "./listing";
import styles from "../Pantry/pantry.module.css";

type CollectionProps = {
  /** A slug from COLLECTIONS. The page checks it before rendering. */
  slug: string;
  /** The catalogue loaded on the server, so the first HTML already lists the products. */
  initialProducts?: Product[];
};

/** One shop collection, such as /shop/dried-mushrooms: every product in it, with a sort control. */
export default function Collection({ slug, initialProducts }: CollectionProps) {
  const collection = findCollection(slug)!;
  const params = useSearchParams();
  const pathname = usePathname();
  const openPanel = useOpenPanel();
  const { products: catalogue, loading, error } = useProducts({ limit: 100 }, initialProducts);
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);
  const { sort } = readShopQuery(params);
  const products = useMemo(() => sortProducts(collectionProducts(collection, catalogue), sort), [collection, catalogue, sort]);
  // Update the URL in the browser only, as the shop does, so the page does not refetch on every change.
  const sortBy = (next: Sort) => window.history.pushState(null, "", next === "recommended" ? pathname : `${pathname}?sort=${next}`);
  const summary = `${products.length} ${products.length === 1 ? "product" : "products"}`;

  return <main id="main" className={styles.page}>
    <div className={`${styles.pageHead} ${styles.shopHead}`}>
      <div>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <Link href="/shop">Shop</Link><span aria-hidden="true">/</span><span aria-current="page">{collection.name}</span>
        </nav>
        <p className={styles.kicker}>{collection.kicker}</p>
        <h1>{collection.heading[0]}<em>{collection.heading[1]}</em></h1>
        <p className={styles.shopIntro}>{collection.intro}</p>
      </div>
      <button type="button" className={styles.shopDelivery} onClick={() => openPanel("delivery")}>
        <MapPin size={15} aria-hidden="true" /> Check delivery
      </button>
    </div>

    <div className={styles.filterMeta}>
      <div className={styles.filterStatus}>
        <p className={styles.count} role="status">{loading ? "Opening the pantry…" : summary}</p>
      </div>
      <div className={styles.toolbarActions}>
        <label className={styles.sort}><span>Sort by</span>
          <select value={sort} onChange={event => sortBy(event.target.value as Sort)}>
            {sorts.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
    </div>

    <section id="products" aria-label="Products" className={styles.results}>
      {loading ? <div className={styles.products} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.skeleton}><div /><p /><p /></div>)}
      </div> : error ? <div className={styles.recovery} role="alert">
        <h2>The pantry couldn’t load.</h2>
        <p>Check your connection and try again.</p>
        <button className={styles.primaryAction} onClick={() => window.location.reload()}>Try again</button>
      </div> : products.length ? <div className={styles.products}>
        {products.map((product, index) => <ProductCard key={product.id} product={product} label={productKind(product)} delivery={isFreshMushroom(product) ? "fresh" : undefined}
          titleAs="h2" priority={index < 4} onNotify={setNotifyFor} />)}
      </div> : <div className={styles.recovery}>
        <h2>Nothing here just now.</h2>
        <p>See the whole pantry for what is in stock today.</p>
        <Link className={styles.primaryAction} href="/shop">All products</Link>
      </div>}
    </section>

    <CollectionLinks current={collection.slug} />

    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </main>;
}
