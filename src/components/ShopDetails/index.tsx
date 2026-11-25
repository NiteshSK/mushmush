"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Heart, MapPin, Minus, Plus, Sprout, Truck } from "lucide-react";
import type { Product } from "@/types/product";
import { type AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart, removeItemFromCart, selectCartItems, updateCartItemQuantity } from "@/redux/features/cart-slice";
import { useWishlist } from "@/app/context/WishlistContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSession } from "next-auth/react";
import NotifyMeModal from "../NotifyMeModal";
import { useOpenPanel } from "../Pantry/PantryShell";
import { GROW_CATEGORY, deliveryScope, isFreshMushroom, isGrowProduct, packLabel, productKind, rupees, sentenceCase } from "../Pantry/catalogue";
import { productSections, slugWords } from "./content";
import Gallery from "./Gallery";
import ProductInformation from "./ProductInformation";
import Reviews, { Stars } from "./Reviews";
import Related from "./Related";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/decide.module.css";

type Load = { status: "loading" } | { status: "ready"; product: Product } | { status: "missing" } | { status: "error" } | { status: "none" };

const LOW_STOCK = 10;
const WHATSAPP = "https://wa.me/917618362662";
/** Sign-in returns the shopper to this product. */
const signInHref = (slug: string) => `/auth/signin?callbackUrl=${encodeURIComponent(`/shop-details/${slug}`)}`;
const shelfOrder = ["spices", "dry-fruits", "seeds", "edible", "medicinal", "powders", "tinctures"];
// Shopper-facing names for the short mushroom category titles stored in the database ("Edible", "Medicinal", "Dry Powder").
const shelfNames: Record<string, string> = { edible: "Edible mushrooms", medicinal: "Medicinal mushrooms", powders: "Mushroom powders" };

export type Shelf = { slug: string; title: string; href: string; grow: boolean };

/**
 * The shelf a product belongs to, for the breadcrumb and related packs. Fresh mushrooms belong to the edible shelf.
 * Spawn and grow bags belong to "Grow your own", even where the catalogue still files them under Seeds:
 * the slug stays the stored category (for the related fetch), but the name and link are the grow band.
 */
function shelf(product: Product): Shelf | undefined {
  const categories = (product.categories ?? []).map(({ category }) => category);
  const rank = (slug: string) => { const i = shelfOrder.indexOf(slug); return i < 0 ? shelfOrder.length : i; };
  const grow = isGrowProduct(product);
  const primary = (grow && categories.find(category => category.slug === GROW_CATEGORY))
    || (isFreshMushroom(product) && categories.find(category => category.slug === "edible"))
    || categories.slice().sort((a, b) => rank(a.slug) - rank(b.slug))[0];
  if (!primary) return undefined;
  if (grow) return { slug: primary.slug, title: "Grow your own", href: "/#grow", grow };
  return { slug: primary.slug, title: shelfNames[primary.slug] ?? sentenceCase(primary.title), href: `/shop?category=${encodeURIComponent(primary.slug)}`, grow };
}

/** Spawn and grow bags are growing supplies. Say so before the shopper adds one, and point to training and bulk orders. */
function GrowNote() {
  return <div className={styles.growNote} role="note" aria-labelledby="grow-note-title">
    <p id="grow-note-title" className={styles.growTitle}><Sprout aria-hidden="true" />For growing mushrooms. Not for eating.</p>
    <p>Use it to grow your own mushrooms, then cook only the mushrooms you harvest.</p>
    <p className={styles.growLinks}>
      <Link href="/training" className={pantry.textAction}>Learn to grow with our training</Link>
      <Link href="/contact?subject=Bulk%20spawn" className={pantry.textAction}>Buying for a farm? Ask about bulk spawn</Link>
    </p>
  </div>;
}

const photos = (product: Product) => Array.from(new Set([...(product.imgs?.previews ?? []), ...(product.imgs?.thumbnails ?? [])].filter(Boolean)));

/** The bare /shop-details entry: older pages stored the chosen product in Redux or localStorage before navigating. */
function storedProduct(fromStore?: Partial<Product>): Partial<Product> | null {
  if (fromStore?.slug || fromStore?.id) return fromStore;
  try {
    const saved = JSON.parse(window.localStorage.getItem("productDetails") ?? "null");
    return saved && (saved.slug || saved.id) ? saved : null;
  } catch { return null; }
}

function useProductDetails(slug?: string) {
  const router = useRouter();
  const fromStore = useAppSelector(state => state.productDetailsReducer?.value);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let query = slug ? `slug=${encodeURIComponent(slug)}` : "";
    let id: number | undefined;
    if (!slug) {
      const stored = storedProduct(fromStore);
      if (stored?.slug) { router.replace(`/shop-details/${stored.slug}`); return; }
      if (stored?.id) { id = Number(stored.id); query = `id=${id}`; }
    }
    if (!query) { setLoad({ status: "none" }); return; }
    const controller = new AbortController();
    setLoad({ status: "loading" });
    fetch(`/api/products?${query}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
      .then(data => {
        const product: Product | undefined = (data.products ?? []).find((item: Product) => slug ? item.slug === slug : item.id === id);
        setLoad(product ? { status: "ready", product } : { status: "missing" });
      })
      .catch(() => { if (!controller.signal.aborted) setLoad({ status: "error" }); });
    return () => controller.abort();
    // The stored product is only a one-time fallback for the bare entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, attempt]);

  return { load, retry: useCallback(() => setAttempt(n => n + 1), []) };
}

/** Add, then a quantity stepper capped by stock. Lines carry slug and stockQuantity, like the pantry ProductCard. */
function BuyControl({ product, onNotify }: { product: Product; onNotify: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const quantity = useAppSelector(selectCartItems).find(item => item.id === product.id)?.quantity ?? 0;
  const stock = product.stockQuantity ?? Infinity;
  const soldOut = !product.inStock || stock < 1;

  const add = () => dispatch(addItemToCart({ id: product.id, slug: product.slug, title: product.title, imgs: product.imgs, price: product.price,
    discountedPrice: product.discountedPrice ?? undefined, stockQuantity: product.stockQuantity, quantity: 1 }));
  const subtract = () => quantity <= 1 ? dispatch(removeItemFromCart(product.id)) : dispatch(updateCartItemQuantity({ id: product.id, quantity: quantity - 1 }));

  // A sold-out pack always offers the stock alert, even when an older bag still holds it (the bag note offers removal).
  if (soldOut) return <button type="button" className={styles.add} onClick={onNotify} aria-label={`${product.title} is sold out. Notify me when it is back`}>Notify me</button>;
  if (quantity) return <div className={styles.stepper} role="group" aria-label={`Quantity of ${product.title}`}>
    <button type="button" onClick={subtract} aria-label={`Remove one ${product.title}`}><Minus aria-hidden="true" /></button>
    <span aria-live="polite" aria-label={`${quantity} in bag`}>{quantity}</span>
    <button type="button" onClick={add} disabled={quantity >= stock} aria-label={`Add one ${product.title}`}><Plus aria-hidden="true" /></button>
  </div>;
  return <button type="button" className={styles.add} onClick={add} aria-label={`Add ${product.title} to bag`}><Plus aria-hidden="true" />Add to bag</button>;
}

function SaveButton({ productId, title }: { productId: number; title: string }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const session = useSession();
  const saved = isInWishlist(productId);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<"saved" | "removed" | "failed" | null>(null);

  async function toggle() {
    if (session?.status !== "authenticated") {
      // Same as the ProductCard heart: wishlists belong to an account, so sign in and come back to this page.
      window.location.assign(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setBusy(true);
    try {
      // A toggle, like the heart on product cards: no confirmation pop-up.
      const done = saved ? await removeFromWishlist(productId, { confirm: false }) : await addToWishlist(productId);
      setNote(done ? (saved ? "removed" : "saved") : saved ? null : "failed");
    } catch {
      setNote("failed");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className={styles.save} onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={`Save ${title} to wishlist`}
      title={saved ? "Saved to your wishlist" : "Save to wishlist"}>
      <Heart aria-hidden="true" />
    </button>
    <p className={styles.saveNote} role="status">
      {note === "saved" ? "Saved to your wishlist." : note === "removed" ? "Removed from your wishlist."
        : note === "failed" ? "We couldn’t update your wishlist. Please try again." : null}
    </p>
  </>;
}

function Recovery({ load, slug, retry }: { load: Exclude<Load, { status: "ready" | "loading" }>; slug?: string; retry: () => void }) {
  const words = slug ? slugWords(slug) : "";
  if (load.status === "error") return <div className={pantry.recovery} role="alert">
    <h1 className={styles.recoveryTitle}>This product couldn’t load.</h1>
    <p>Check your connection and try again.</p>
    <button type="button" className={pantry.primaryAction} onClick={retry}>Try again</button>
  </div>;
  return <div className={pantry.recovery}>
    <h1 className={styles.recoveryTitle}>{load.status === "none" ? "Choose a product to see its details." : "We couldn’t find that product."}</h1>
    <p>{load.status === "none" ? "Browse the pantry or search by product or ingredient." : "The link may be old, or the product may have a new name."}</p>
    <div className={styles.recoveryActions}>
      {words ? <Link href={`/search?search=${encodeURIComponent(words)}`} className={pantry.primaryAction}>Search for “{words}”</Link>
        : <Link href="/search" className={pantry.primaryAction}>Search the pantry</Link>}
      <Link href="/shop" className={pantry.textAction}>Shop the whole pantry</Link>
    </div>
    <p className={pantry.suggestions}>Or browse <span className={pantry.chips}>
      <Link href="/shop?category=spices">Spices</Link><Link href="/shop?category=dry-fruits">Dry fruits</Link>
      <Link href="/shop?category=seeds">Seeds</Link><Link href="/shop?category=edible">Edible mushrooms</Link>
    </span></p>
  </div>;
}

function Loading() {
  return <div className={styles.top} aria-hidden="true">
    <div className={styles.skeletonPhoto} />
    <div className={styles.skeletonPanel}><p /><p /><p /><p /></div>
  </div>;
}

function ProductView({ product }: { product: Product }) {
  const openPanel = useOpenPanel();
  const dispatch = useDispatch<AppDispatch>();
  const actions = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [notifyFor, setNotifyFor] = useState<Product | null>(null);
  const inBag = useAppSelector(selectCartItems).find(item => item.id === product.id)?.quantity ?? 0;
  const { addToRecentlyViewed } = useRecentlyViewed();
  const track = useRef(addToRecentlyViewed);
  track.current = addToRecentlyViewed;

  const price = product.discountedPrice ?? product.price;
  const stock = product.stockQuantity ?? Infinity;
  const soldOut = !product.inStock || stock < 1;
  const scope = deliveryScope(product);
  const kind = productKind(product);
  const category = shelf(product);
  const grow = isGrowProduct(product);
  const sections = productSections(product);
  const reviewCount = product.reviewCount ?? 0;
  useEffect(() => {
    const timer = setTimeout(() => track.current(product.id), 500);
    return () => clearTimeout(timer);
  }, [product.id]);

  // On phones, show the purchase bar once the shopper has scrolled past the Add control.
  // While Add is still below the screen the bar stays hidden, so it never covers the controls above Add.
  useEffect(() => {
    const element = actions.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setBarVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0)), { rootMargin: "-62px 0px 0px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const notify = () => setNotifyFor(product);
  const offer = <>
    <span className={styles.price}>{rupees.format(price)}</span>
    {price < product.price && <s className={styles.was}><span className={pantry.srOnly}>Was </span>{rupees.format(product.price)}</s>}
  </>;

  return <>
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      <ol>
        <li><Link href="/shop">Shop</Link></li>
        {category && <li><Link href={category.href}>{category.title}</Link></li>}
        <li aria-current="page">{product.title}</li>
      </ol>
    </nav>

    <div className={styles.top}>
      <div className={pantry.exclusiveHost}>
        {scope === "fresh" && <span className={pantry.exclusive}><MapPin aria-hidden="true" />Dehradun exclusive</span>}
        <Gallery images={photos(product)} title={product.title} />
      </div>

      <section className={styles.panel} aria-labelledby="product-title">
        {kind && <p className={pantry.kicker}>{kind}</p>}
        <h1 id="product-title" className={styles.title}>{product.title}</h1>
        <p className={styles.offer}>
          <span className={styles.pack}>{packLabel(product)}</span><span aria-hidden="true" className={styles.dot}>·</span>
          {offer}
          {product.hasDiscount && product.discountPercentage ? <span className={styles.off}>{product.discountPercentage}% off</span> : null}
        </p>
        {reviewCount > 0 && <a href="#reviews" className={styles.rating}>
          <Stars rating={product.averageRating ?? 0} /><span>{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
        </a>}
        {grow && <GrowNote />}

        <ul className={styles.facts}>
          <li className={styles.stock} data-state={soldOut ? "out" : stock <= LOW_STOCK ? "low" : "in"}>
            <i aria-hidden="true" />{soldOut ? "Sold out" : stock <= LOW_STOCK ? `Only ${stock} left` : "In stock"}
          </li>
          <li className={styles.delivery} data-scope={scope}>
            <span>{scope === "fresh" ? <><MapPin aria-hidden="true" />Fresh · Dehradun only</> : <><Truck aria-hidden="true" />Ships across India</>}</span>
            <button type="button" className={pantry.textAction} onClick={() => openPanel("delivery")}>Check delivery</button>
          </li>
        </ul>
        <div className={styles.actions} ref={actions}>
          <BuyControl product={product} onNotify={notify} />
          <SaveButton productId={product.id} title={product.title} />
        </div>
        {inBag > 0 && (soldOut ? <p className={styles.bagNote}>
          <span>Your bag has {inBag}, but this pack is sold out.</span>
          <button type="button" className={pantry.textAction} onClick={() => dispatch(removeItemFromCart(product.id))}>Remove from bag</button>
        </p> : <p className={styles.bagNote}>
          <span>{inBag} in your bag{inBag >= stock ? ` · that is all ${stock} we have` : ""}</span>
          <Link href="/checkout" className={pantry.textAction}>Go to checkout</Link>
        </p>)}
        {scope === "fresh" && <p className={styles.aside}>
          Outside Dehradun? <Link href="/search?search=dried%20mushrooms">Dried mushrooms</Link> ship across India.
        </p>}
        <ProductInformation title={product.title} sections={sections} />
        <p className={styles.ask}><a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={pantry.textAction}>Ask us on WhatsApp</a></p>
      </section>
    </div>

    <div className={styles.reading}>
      <Reviews productId={product.id} title={product.title} signIn={signInHref(product.slug)} />
    </div>

    <Related product={product} category={category} onNotify={setNotifyFor} />

    <div className={styles.bar} data-visible={barVisible} aria-hidden={!barVisible}>
      <p className={styles.barOffer}><span className={styles.pack}>{packLabel(product)}</span>{offer}</p>
      {barVisible && <BuyControl product={product} onNotify={notify} />}
    </div>

    {notifyFor && <NotifyMeModal isOpen onClose={() => setNotifyFor(null)} productId={notifyFor.id} productTitle={notifyFor.title} />}
  </>;
}

/** Product details for /shop-details/[slug] and the bare /shop-details entry. Prices come from /api/products as served. */
export default function ShopDetails({ slug }: { slug?: string }) {
  const { load, retry } = useProductDetails(slug);
  return <main id="main" className={`${pantry.page} ${styles.detail}`} aria-busy={load.status === "loading"}>
    {load.status === "loading" ? <><p className={pantry.srOnly} role="status">Opening the product…</p><Loading /></>
      : load.status === "ready" ? <ProductView key={load.product.id} product={load.product} />
        : <Recovery load={load} slug={slug} retry={retry} />}
  </main>;
}
