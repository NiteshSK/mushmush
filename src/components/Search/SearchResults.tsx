"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import NotifyMeModal from "../NotifyMeModal";
import ProductCard from "../Pantry/ProductCard";
import { useOpenPanel } from "../Pantry/PantryShell";
import { deliveryScope, productKind, searchCatalogue } from "../Pantry/catalogue";
import { loadListings, type Listing } from "../Training/programme";
import styles from "../Pantry/pantry.module.css";
import search from "./search.module.css";
import TrainingResults from "./TrainingResults";
import { couldMatchTraining, matchesTraining } from "./training-match";

const examples = ["Walnuts", "Cumin", "Dried mushrooms"];
const browse = [{ slug: "spices", label: "Spices" }, { slug: "dry-fruits", label: "Dry fruits" }, { slug: "seeds", label: "Seeds" }];

function trimOrBlock(event: FormEvent<HTMLFormElement>) {
  const field = event.currentTarget.elements.namedItem("search") as HTMLInputElement;
  field.value = field.value.trim();
  if (!field.value) { event.preventDefault(); field.reportValidity(); }
}

function Suggestions() {
  return <div className={styles.suggestions}>
    <p>Try <span className={styles.chips}>{examples.map(term => <Link key={term} href={`/search?search=${encodeURIComponent(term.toLowerCase())}`}>{term}</Link>)}</span></p>
    <p>Or browse <span className={styles.chips}>{browse.map(({ slug, label }) => <Link key={slug} href={`/shop?category=${slug}`}>{label}</Link>)}
      <Link href="/training">Training</Link>
      <Link href="/shop">The whole pantry</Link></span></p>
  </div>;
}

export default function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("search") ?? params.get("q") ?? "").trim();
  const shown = query.length > 60 ? `${query.slice(0, 60)}…` : query;
  const openPanel = useOpenPanel();
  const { products, loading, error } = useProducts({ limit: 100 });
  const results = useMemo(() => searchCatalogue(products, query), [products, query]);
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);

  // Load the courses only for a query that could be about training. If they fail, show products only.
  const wantsTraining = couldMatchTraining(query);
  const [training, setTraining] = useState<Listing[] | "loading" | null>(null);
  useEffect(() => {
    if (!wantsTraining) { setTraining(null); return; }
    let active = true;
    setTraining("loading");
    loadListings()
      .then(listings => { if (active) setTraining(listings); })
      .catch(() => { if (active) setTraining(null); });
    return () => { active = false; };
  }, [wantsTraining]);
  const courses = useMemo(() => {
    if (!Array.isArray(training)) return [];
    const matched = matchesTraining(query, training.map(({ program }) => program));
    return training.filter(({ program }) => matched.indexOf(program) >= 0);
  }, [training, query]);

  return <main id="main" className={styles.page}>
    <div className={styles.pageHead}>
      <div>
        <p className={styles.kicker}>Search the pantry</p>
        <h1>{query ? <>Results for <em>“{shown}”</em></> : <>What are you <em>looking for?</em></>}</h1>
      </div>
      <p className={styles.deliveryNote}>
        <span>Pantry goods ship across India. Fresh mushrooms are available only in Dehradun.</span>
        <button onClick={() => openPanel("delivery")}>Check delivery</button>
      </p>
    </div>

    <form action="/search" role="search" className={styles.searchForm} onSubmit={trimOrBlock} key={query}>
      <label htmlFor="search-page-field">Product or ingredient</label>
      <div className={styles.field}>
        <input id="search-page-field" type="search" name="search" required defaultValue={query} placeholder="Try walnuts or cumin" autoComplete="off" />
        <button>Search</button>
      </div>
    </form>

    <section id="results" aria-label="Search results" className={styles.results}>
      {!query ? <div className={styles.recovery}>
        <h2>Search by product or ingredient.</h2>
        <p>Local names work too, such as haldi, jeera or akhrot.</p>
        <Suggestions />
      </div> : <>{courses.length > 0 && <TrainingResults listings={courses} />}
      {loading || (training === "loading" && !results.length) ? <>
        <p className={styles.count} role="status">Searching the pantry…</p>
        <div className={styles.products} aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <div key={i} className={styles.skeleton}><div /><p /><p /></div>)}</div>
      </> : error ? <div className={styles.recovery} role="alert">
        <h2>Search couldn’t load.</h2>
        <p>Check your connection and try again.</p>
        <button className={styles.primaryAction} onClick={() => window.location.reload()}>Try again</button>
      </div> : results.length ? <>
        <p className={styles.count} role="status">{results.length} {results.length === 1 ? "product" : "products"} for “{shown}”</p>
        <div className={styles.products}>
          {results.map((product, index) => <ProductCard key={product.id} product={product} label={productKind(product)} delivery={deliveryScope(product)}
            titleAs="h2" priority={index < 4} onNotify={setNotifyFor} />)}
        </div>
      </> : courses.length ? <p className={`${styles.count} ${search.noProducts}`} role="status">
        No pantry products match “{shown}”.<Link href="/shop" className={styles.textAction}>Browse the pantry</Link>
      </p> : <div className={styles.recovery} role="status">
        <h2>Nothing in the pantry matches “{shown}”.</h2>
        <p>Check the spelling, or try a shorter or more general word.</p>
        <Suggestions />
      </div>}</>}
    </section>

    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </main>;
}
