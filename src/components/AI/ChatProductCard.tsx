"use client";

import { sellablePackLimit } from "@/lib/inventory";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { useWishlist } from "@/app/context/WishlistContext";
import { type AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart, removeItemFromCart, selectCartItems, updateCartItemQuantity } from "@/redux/features/cart-slice";
import { packLabel, rupees } from "@/components/Pantry/catalogue";
import s from "../Pantry/chat.module.css";

export interface ChatProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  discountedPrice: number | null;
  discountPercentage: number;
  hasDiscount: boolean;
  inStock: boolean;
  imgs: { thumbnails: string[]; previews: string[] };
  averageRating: number;
  reviewCount: number;
  measurementValue: number;
  measurementType: string;
  stockQuantity?: number;
}

interface ChatProductCardProps {
  product: ChatProduct;
  /** Buy this product now through the checkout inside the chat. */
  onBuy: (product: ChatProduct) => void;
  /** Called when the shopper follows the product link, so the chat can close. */
  onOpen?: () => void;
}

const ChatProductCard: React.FC<ChatProductCardProps> = ({ product, onBuy, onOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const quantity = useAppSelector(selectCartItems).find((item) => item.id === product.id)?.quantity ?? 0;
  const stock = sellablePackLimit(product);
  const soldOut = stock === 0;
  const discounted = product.hasDiscount && product.discountedPrice ? product.discountedPrice : null;
  const price = discounted ?? product.price;
  const thumbnail = product.imgs?.thumbnails?.[0] || product.imgs?.previews?.[0];
  const [imageFailed, setImageFailed] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = async () => {
    setWishlistLoading(true);
    try {
      if (inWishlist) await removeFromWishlist(product.id);
      else await addToWishlist(product.id);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Same bag line as the shop card: identity and stock limit travel with it.
  const add = () => {
    dispatch(addItemToCart({
      id: product.id, slug: product.slug, title: product.title, imgs: product.imgs, price: product.price,
      discountedPrice: discounted ?? undefined, stockQuantity: product.stockQuantity, quantity: 1,
    }));
  };
  const subtract = () => {
    if (quantity <= 1) dispatch(removeItemFromCart(product.id));
    else dispatch(updateCartItemQuantity({ id: product.id, quantity: quantity - 1 }));
  };

  return (
    <article className={s.product}>
      <div className={s.photo}>
        {thumbnail && !imageFailed && <img src={thumbnail} alt="" loading="lazy" onError={() => setImageFailed(true)} />}
      </div>
      <div className={s.info}>
        <p className={s.pack}>
          <span>{packLabel(product)}</span>
          {product.averageRating > 0 && (
            <span className={s.rating}>
              <Star aria-hidden="true" />{product.averageRating.toFixed(1)}<span className={s.srOnly}> out of 5</span>
            </span>
          )}
        </p>
        <h3 className={s.productTitle}>
          {product.slug ? <Link href={`/shop-details/${product.slug}`} onClick={onOpen}>{product.title}</Link> : product.title}
        </h3>
        <p className={s.price}>
          {rupees.format(price)}
          {discounted !== null && (
            <>
              <s className={s.was}><span className={s.srOnly}>Was </span>{rupees.format(product.price)}</s>
              <span className={s.off}>{product.discountPercentage}% off</span>
            </>
          )}
        </p>
      </div>
      <div className={s.actions}>
        {quantity ? (
          <div className={s.stepper} role="group" aria-label={`Quantity of ${product.title}`}>
            <button type="button" onClick={subtract} aria-label={`Remove one ${product.title}`}><Minus aria-hidden="true" /></button>
            <span aria-live="polite" aria-label={`${quantity} in bag`}>{quantity}</span>
            <button type="button" onClick={add} disabled={stock === null || quantity >= stock} aria-label={`Add one ${product.title}`}><Plus aria-hidden="true" /></button>
          </div>
        ) : soldOut ? (
          <button type="button" className={s.add} disabled aria-label={`${product.title} sold out`}>Sold out</button>
        ) : stock === null ? (
          <button type="button" className={s.add} disabled>Stock unconfirmed</button>
        ) : (
          <button type="button" className={s.add} onClick={add}>
            <Plus aria-hidden="true" />Add<span className={s.srOnly}> {product.title}</span> to bag
          </button>
        )}
        {Boolean(stock) && (
          <button type="button" className={s.buyNow} onClick={() => onBuy(product)}>
            Buy now<span className={s.srOnly}> {product.title}</span>
          </button>
        )}
        <button
          type="button"
          className={s.save}
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-pressed={inWishlist}
          aria-label={`Save ${product.title} to wishlist`}
          title={inWishlist ? "Saved to your wishlist" : "Save to wishlist"}
        >
          <Heart aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default ChatProductCard;
