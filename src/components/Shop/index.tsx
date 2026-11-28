"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import { trackVisitAction, visitShopContext } from "@/lib/visit-analytics";
import NotifyMeModal from "../NotifyMeModal";
import ProductCard from "../Pantry/ProductCard";
import { useOpenPanel } from "../Pantry/PantryShell";
import { isFreshMushroom, productKind } from "../Pantry/catalogue";
import CollectionLinks from "./CollectionLinks";
import { categoryOptions, isMushroomCategory, readShopQuery, shopPage, shortTitle, sorts, splitCatalogue, type Sort } from "./listing";
import styles from "../Pantry/pantry.module.css";

export { PRODUCTS_PER_PAGE } from "./listing";

type ShopProps = {
  /** The catalogue loaded on the server, so the first HTML already lists the products. */
  initialProducts?: Product[];
};

export default function Shop({ initialProducts }: ShopProps = {}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const openPanel = useOpenPanel();
  const { products: catalogue, loading, error } = useProducts({ limit: 100 }, initialProducts);
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);
  // Spawn and grow bags are for growing mushrooms, not food: they have their own band on the homepage.
  const { products, growing } = useMemo(() => splitCatalogue(catalogue), [catalogue]);

  const categories = useMemo(() => categoryOptions(products), [products]);
  const { requested, wantsGrow, sort, requestedPage } = readShopQuery(params);
  // The category link /shop?category=grow-your-own (stored on the category) opens the homepage band.
  useEffect(() => { if (wantsGrow) window.location.replace("/#grow"); }, [wantsGrow]);
  // Keep the requested categories while loading; afterwards ignore slugs that are not in the catalogue.
  const selected = loading ? requested : requested.filter(slug => categories.some(category => category.slug === slug));
  const visitFilters = visitShopContext(params.toString());
  const previousVisitFilters = useRef(visitFilters);
  useEffect(() => {
    if (visitFilters !== previousVisitFilters.current) trackVisitAction("shop_filter", visitFilters);
    previousVisitFilters.current = visitFilters;
  }, [visitFilters]);

  const { filtered, pages, page, visible } = useMemo(() => shopPage(products, selected, sort, requestedPage),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [products, selected.join(","), sort, requestedPage]);
  const filtering = selected.length > 0 || sort !== "recommended";

  function href(next: { category?: string[]; sort?: Sort; page?: number }) {
    const query: string[] = [];
    const nextCategories = next.category ?? selected;
    const nextSort = next.sort ?? sort;
    const nextPage = next.page ?? 1;
    if (nextCategories.length) query.push(`category=${nextCategories.map(encodeURIComponent).join(",")}`);
    if (nextSort !== "recommended") query.push(`sort=${nextSort}`);
    if (nextPage > 1) query.push(`page=${nextPage}`);
    return query.length ? `${pathname}?${query.join("&")}` : pathname;
  }
  // Update the URL in the browser only (Next.js keeps useSearchParams in sync with history.pushState).
  // A router navigation would refetch the page and briefly collapse it, which made the page jump on every filter click.
  const go = (next: Parameters<typeof href>[0]) => window.history.pushState(null, "", href(next));
  const toggle = (slug: string) => go({ category: selected.includes(slug) ? selected.filter(s => s !== slug) : [...selected, slug] });
  const toProducts = () => document.getElementById("products")?.scrollIntoView({ block: "start" });

  const groups = [
    { label: "Pantry", items: categories.filter(category => !isMushroomCategory(category)) },
    { label: "Mushrooms", items: categories.filter(isMushroomCategory) },
  ];
  const names = selected.map(slug => categories.find(c => c.slug === slug)?.title).filter(Boolean);
  const summary = `${filtered.length} ${filtered.length === 1 ? "product" : "products"}${names.length ? ` in ${names.join(", ")}` : ""}`;

  return <main id="main" className={styles.page}>
    <div className={`${styles.pageHead} ${styles.shopHead}`}>
      <div>
        <p className={styles.kicker}>Herbertpur, Dehradun</p>
        <h1>The <em>pantry.</em></h1>
        <p className={styles.shopIntro}>Dried mushrooms, spices, dry fruits and seeds, packed by us in Herbertpur and sent across India. Fresh mushrooms go to kitchens in Dehradun.</p>
      </div>
      <button type="button" className={styles.shopDelivery} onClick={() => openPanel("delivery")}>
        <MapPin size={15} aria-hidden="true" /> Check delivery
      </button>
    </div>

    <div className={styles.catalogueFilters}>
      <div className={styles.filterRow} role="group" aria-label="Filter by category">
        <button type="button" className={styles.chip} onClick={() => go({ category: [] })} aria-pressed={!selected.length}>
          All{!loading && <span className={styles.chipCount} aria-hidden="true">{products.length}</span>}
        </button>
        {groups.map(group => group.items.length > 0 && <div key={group.label} className={styles.filterGroup}>
          <span className={styles.groupLabel}>{group.label}</span>
          {group.items.map(category => <button key={category.slug} type="button" className={styles.chip} onClick={() => toggle(category.slug)}
            aria-pressed={selected.includes(category.slug)}
            aria-label={`${category.title}, ${category.count} ${category.count === 1 ? "product" : "products"}`}>
            {shortTitle(category)}<span className={styles.chipCount} aria-hidden="true">{category.count}</span>
          </button>)}
        </div>)}
        {growing.length > 0 && <Link href="/#grow" className={styles.growJump}>Spawn and grow bags<ArrowRight size={15} aria-hidden="true" /></Link>}
      </div>
    </div>

    <div className={styles.filterMeta}>
      <div className={styles.filterStatus}>
        <p className={styles.count} role="status">{loading ? "Opening the pantry…" : summary}</p>
        {filtering && <button type="button" className={styles.textAction} onClick={() => go({ category: [], sort: "recommended" })}>Clear filters</button>}
      </div>
      <div className={styles.toolbarActions}>
        <label className={styles.sort}><span>Sort by</span>
          <select value={sort} onChange={event => go({ sort: event.target.value as Sort })}>
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
      </div> : visible.length ? <div className={styles.products}>
        {visible.map((product, index) => <ProductCard key={product.id} product={product} label={productKind(product)} delivery={isFreshMushroom(product) ? "fresh" : undefined}
          titleAs="h2" priority={index < 4} onNotify={setNotifyFor} />)}
      </div> : <div className={styles.recovery}>
        <h2>Nothing matches these filters.</h2>
        <p>Clear the filters to see the whole pantry.</p>
        <button className={styles.primaryAction} onClick={() => go({ category: [], sort: "recommended" })}>Clear filters</button>
      </div>}
    </section>

    {!loading && !error && pages > 1 && <nav className={styles.pagination} aria-label="Product pages">
      {page > 1 ? <Link href={href({ page: page - 1 })} scroll={false} onClick={toProducts}>Previous</Link> : <span aria-hidden="true" />}
      <ol>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => <li key={n}>
          <Link href={href({ page: n })} scroll={false} onClick={toProducts} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}>{n}</Link>
        </li>)}
      </ol>
      {page < pages ? <Link href={href({ page: page + 1 })} scroll={false} onClick={toProducts}>Next</Link> : <span aria-hidden="true" />}
    </nav>}

    <CollectionLinks current="all" />

    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </main>;
}
