"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Minus, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useOptionalWishlist } from "@/app/context/WishlistContext";
import type { Product } from "@/types/product";
import { type AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart, removeItemFromCart, selectCartItems, updateCartItemQuantity } from "@/redux/features/cart-slice";
import { type DeliveryScope, isFreshMushroom, packLabel, productCover, rupees } from "./catalogue";
import styles from "./pantry.module.css";

type Props = {
  product: Product;
  /** Short kind shown before the pack size, e.g. "Spices". */
  label?: string;
  /** Show the delivery line. The homepage shelf omits it because its heading already says "Delivered across India". */
  delivery?: DeliveryScope;
  titleAs?: "h2" | "h3";
  sizes?: string;
  priority?: boolean;
  onNotify?: (product: Product) => void;
};

export default function ProductCard({ product, label, delivery, titleAs: Title = "h3", sizes, priority, onNotify }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [imageFailed, setImageFailed] = useState(false);
  const quantity = useAppSelector(selectCartItems).find(item => item.id === product.id)?.quantity ?? 0;
  const stock = product.stockQuantity ?? Infinity;
  const soldOut = !product.inStock || stock < 1;
  const price = product.discountedPrice ?? product.price;
  const image = productCover(product);
  const url = `/shop-details/${product.slug}`;
  const wishlist = useOptionalWishlist();
  const status = useSession()?.status;
  const saved = wishlist?.isInWishlist(product.id) ?? false;
  const [saving, setSaving] = useState(false);

  async function toggleSaved() {
    if (!wishlist) return;
    if (status !== "authenticated") {
      // Wishlists belong to an account: sign in, then come back to this page.
      window.location.assign(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setSaving(true);
    const done = saved ? await wishlist.removeFromWishlist(product.id, { confirm: false }) : await wishlist.addToWishlist(product.id);
    setSaving(false);
    if (done) toast.success(saved ? `Removed ${product.title} from your wishlist` : `Saved ${product.title} to your wishlist`);
    else toast.error("Your wishlist couldn’t be updated. Try again.");
  }

  function add() {
    dispatch(addItemToCart({ id: product.id, slug: product.slug, title: product.title, imgs: product.imgs, price: product.price,
      discountedPrice: product.discountedPrice ?? undefined, stockQuantity: product.stockQuantity, quantity: 1 }));
  }
  function subtract() {
    if (quantity <= 1) dispatch(removeItemFromCart(product.id));
    else dispatch(updateCartItemQuantity({ id: product.id, quantity: quantity - 1 }));
  }

  return <article className={styles.card}>
    <Link href={url} className={styles.productLink}>
      <div className={styles.productPhoto}>
        {isFreshMushroom(product) && <span className={styles.exclusive}><MapPin aria-hidden="true" />Dehradun exclusive</span>}
        {image && !imageFailed && <Image src={image} alt="" fill priority={priority} onError={() => setImageFailed(true)} sizes={sizes ?? "(max-width: 680px) 46vw, (max-width: 900px) 30vw, 24vw"} />}
      </div>
      <p className={styles.pack}>{label && <>{label}<span aria-hidden="true">·</span></>}{packLabel(product)}</p>
      <Title>{product.title}</Title>
    </Link>
    {wishlist && <button className={styles.save} onClick={toggleSaved} disabled={saving} aria-pressed={saved}
      aria-label={`Save ${product.title} to wishlist`} title={saved ? "Saved to your wishlist" : "Save to wishlist"}><Heart aria-hidden="true" /></button>}
    {delivery && <p className={styles.delivery} data-scope={delivery}>
      {delivery === "fresh" ? <><MapPin aria-hidden="true" />Fresh · Dehradun only</> : "Ships across India"}
    </p>}
    <div className={styles.buy}>
      <span className={styles.price}>
        {rupees.format(price)}
        {price < product.price && <s className={styles.was}><span className={styles.srOnly}>Was </span>{rupees.format(product.price)}</s>}
      </span>
      {quantity ? <div className={styles.stepper} role="group" aria-label={`Quantity of ${product.title}`}>
        <button onClick={subtract} aria-label={`Remove one ${product.title}`}><Minus /></button>
        <span aria-live="polite" aria-label={`${quantity} in bag`}>{quantity}</span>
        <button onClick={add} disabled={soldOut || quantity >= stock} aria-label={`Add one ${product.title}`}><Plus /></button>
      </div> : soldOut && onNotify ? <button onClick={() => onNotify(product)} className={styles.add} aria-label={`${product.title} is sold out. Notify me when it is back`}>Notify me</button>
        : soldOut ? <button disabled className={styles.add} aria-label={`${product.title} sold out`}>Sold out</button>
        // Visible text "Add to bag"; screen readers hear "Add {title} to bag".
        : <button onClick={add} className={styles.add}><Plus aria-hidden="true" /><span>Add<span className={styles.srOnly}> {product.title}</span> to bag</span></button>}
    </div>
  </article>;
}
