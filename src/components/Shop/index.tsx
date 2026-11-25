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
import { GROW_CATEGORY, isFreshMushroom, isGrowProduct, productKind, sentenceCase } from "../Pantry/catalogue";
import styles from "../Pantry/pantry.module.css";

export const PRODUCTS_PER_PAGE = 12;

const sorts = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
] as const;
type Sort = typeof sorts[number]["value"];

// Shopping categories first; mushroom categories after them.
const categoryOrder = ["spices", "dry-fruits", "seeds", "edible", "medicinal", "powders", "tinctures"];

type CategoryOption = { slug: string; title: string; count: number; freshOnly: boolean };

const mushroomSlugs = ["edible", "medicinal", "powders", "tinctures"];
const isMushroomCategory = (category: CategoryOption) =>
  mushroomSlugs.includes(category.slug) || /mushroom|tincture/i.test(category.title);
/** "Fresh mushrooms" reads as "Fresh", "Mushroom powders" as "Powders", under the "Mushrooms" label. */
const shortTitle = (category: CategoryOption) =>
  isMushroomCategory(category) ? sentenceCase(category.title.replace(/^mushroom\s+|\s+mushrooms?$/gi, "")) : category.title;
const mushroomNames: Record<string, string> = {
  edible: "Edible mushrooms",
  medicinal: "Medicinal mushrooms",
  powders: "Mushroom powders",
};

function categoryOptions(products: Product[]): CategoryOption[] {
  const map = new Map<string, { title: string; products: Product[] }>();
  for (const product of products) {
    for (const { category } of product.categories ?? []) {
      const entry = map.get(category.slug) ?? { title: category.title, products: [] };
      entry.products.push(product);
      map.set(category.slug, entry);
    }
  }
  const rank = (slug: string) => { const i = categoryOrder.indexOf(slug); return i < 0 ? categoryOrder.length : i; };
  return Array.from(map.entries())
    .map(([slug, { title, products: items }]) => {
      const freshOnly = items.every(isFreshMushroom);
      return { slug, title: slug === "edible" && freshOnly ? "Fresh mushrooms" : mushroomNames[slug] ?? sentenceCase(title), count: items.length, freshOnly };
    })
    .sort((a, b) => rank(a.slug) - rank(b.slug) || a.title.localeCompare(b.title));
}

const unitPrice = (product: Product) => product.discountedPrice ?? product.price;

/** The existing default order: in-stock first, with categories interleaved so the first page shows the whole pantry. */
function recommended(products: Product[]) {
  const spread = (items: Product[]) => {
    const groups = new Map<string, Product[]>();
    for (const item of items) {
      const key = item.categories?.[0]?.category.slug ?? "other";
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    const queues = Array.from(groups.values());
    const result: Product[] = [];
    while (queues.some(queue => queue.length)) for (const queue of queues) { const next = queue.shift(); if (next) result.push(next); }
    return result;
  };
  return [...spread(products.filter(p => p.inStock)), ...spread(products.filter(p => !p.inStock))];
}

function sortProducts(products: Product[], sort: Sort) {
  if (sort === "recommended") return recommended(products);
  const sorted = [...products].sort((a, b) =>
    sort === "price-low" ? unitPrice(a) - unitPrice(b) :
    sort === "price-high" ? unitPrice(b) - unitPrice(a) :
    a.title.localeCompare(b.title));
  return [...sorted.filter(p => p.inStock), ...sorted.filter(p => !p.inStock)];
}

export default function Shop() {
  const params = useSearchParams();
  const pathname = usePathname();
  const openPanel = useOpenPanel();
  const { products: catalogue, loading, error } = useProducts({ limit: 100 });
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);
  // Spawn and grow bags are for growing mushrooms, not food: they have their own band on the homepage.
  const products = useMemo(() => catalogue.filter(p => !isGrowProduct(p)), [catalogue]);
  const growing = useMemo(() => catalogue.filter(isGrowProduct), [catalogue]);

  const categories = useMemo(() => categoryOptions(products), [products]);
  const requestedAll = (params.get("category") ?? "").split(",").map(slug => slug.trim()).filter(Boolean);
  const requested = requestedAll.filter(slug => slug !== GROW_CATEGORY);
  const wantsGrow = requestedAll.includes(GROW_CATEGORY);
  // The category link /shop?category=grow-your-own (stored on the category) opens the homepage band.
  useEffect(() => { if (wantsGrow) window.location.replace("/#grow"); }, [wantsGrow]);
  // Keep the requested categories while loading; afterwards ignore slugs that are not in the catalogue.
  const selected = loading ? requested : requested.filter(slug => categories.some(category => category.slug === slug));
  const sortParam = params.get("sort");
  const visitFilters = visitShopContext(params.toString());
  const previousVisitFilters = useRef(visitFilters);
  useEffect(() => {
    if (visitFilters !== previousVisitFilters.current) trackVisitAction("shop_filter", visitFilters);
    previousVisitFilters.current = visitFilters;
  }, [visitFilters]);
  const sort: Sort = sorts.some(option => option.value === sortParam) ? sortParam as Sort : "recommended";

  const filtered = useMemo(() => sortProducts(
    selected.length ? products.filter(p => p.categories?.some(({ category }) => selected.includes(category.slug))) : products, sort),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [products, selected.join(","), sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const page = Math.min(Math.max(parseInt(params.get("page") ?? "1", 10) || 1, 1), pages);
  const visible = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
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

    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </main>;
}
