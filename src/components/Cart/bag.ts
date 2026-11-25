"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import { useAppSelector } from "@/redux/store";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import { type DeliveryScope, packLabel } from "../Pantry/catalogue";
import { lineScopes } from "../Pantry/delivery";

export type CartItem = ReturnType<typeof selectCartItems>[number];

/** A bag line with the catalogue details the bag does not store. */
export type BagLine = CartItem & {
  /** Product page, from the saved slug or the catalogue. */
  href?: string;
  image?: string;
  /** Pack size such as "200 g", from the catalogue. */
  pack?: string;
  /** Undefined until the catalogue loads, or when the product is not in it. */
  scope?: DeliveryScope;
  unitPrice: number;
  lineTotal: number;
  /** Most packs the shopper can have: the lower of the saved stock cap and live stock. */
  max: number;
  soldOut: boolean;
};

const unitPrice = (item: CartItem) => item.discountedPrice || item.price;

export function enrichLines(items: CartItem[], catalogue: Product[]): BagLine[] {
  const products = new Map(catalogue.map(product => [product.id, product] as const));
  const scopes = lineScopes(items, catalogue);
  return items.map(item => {
    const product = products.get(item.id);
    const slug = item.slug || product?.slug;
    const live = product ? (product.inStock === false ? 0 : product.stockQuantity ?? Infinity) : Infinity;
    const max = Math.min(item.stockQuantity ?? Infinity, live);
    return {
      ...item,
      href: slug ? `/shop-details/${slug}` : undefined,
      image: item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || product?.imgs?.previews?.[0],
      pack: product ? packLabel(product) : undefined,
      scope: scopes.get(item.id),
      unitPrice: unitPrice(item),
      lineTotal: unitPrice(item) * item.quantity,
      max,
      soldOut: max < 1,
    };
  });
}

/**
 * True once the page has mounted and the saved bag has been restored.
 * Pantry routes render before redux-persist rehydrates, so an empty bag before this
 * point does not mean the shopper's bag is empty.
 */
export function useBagReady() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Stores built without redux-persist (tests) have no _persist key; treat them as restored.
  const rehydrated = useAppSelector(state => state._persist?.rehydrated ?? true);
  return mounted && rehydrated;
}

/** The bag with pack sizes, delivery scope and live stock from the catalogue. */
export function useBag() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectTotalPrice);
  const { products, loading, error } = useProducts({ limit: 100 });
  const catalogue: Product[] = products;
  const lines = useMemo(() => enrichLines(items, catalogue), [items, catalogue]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const savings = items.reduce((sum, item) => sum + (item.discountedPrice && item.discountedPrice < item.price ? (item.price - item.discountedPrice) * item.quantity : 0), 0);
  return { lines, subtotal, count, savings, catalogueLoading: loading, catalogueError: error };
}

export type DeliveryQuote = {
  deliverable: boolean;
  zoneName?: string;
  freshEligible?: boolean;
  shippingFee?: number;
  estimatedDays?: string;
  freeShipping?: boolean;
  freeAbove?: number | null;
  message?: string;
};

const PIN_KEY = "kosvana:delivery-pin";
/** The PIN the shopper last checked, so /checkout can start from the PIN entered on /cart. */
export function rememberPin(pin: string) {
  try { sessionStorage.setItem(PIN_KEY, pin); } catch { /* storage can be blocked */ }
}
export function rememberedPin() {
  try { return sessionStorage.getItem(PIN_KEY) ?? ""; } catch { return ""; }
}

/**
 * Delivery fee for a PIN from /api/shipping/check. Checks again when the subtotal
 * changes, because delivery is free above a threshold.
 */
export function useDeliveryQuote(subtotal: number) {
  const [pin, setPin] = useState("");
  const [checkedPin, setCheckedPin] = useState("");
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);

  async function check(next: string) {
    request.current?.abort();
    if (!/^\d{6}$/.test(next)) return;
    const controller = new AbortController();
    request.current = controller;
    setChecking(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/shipping/check?pincode=${next}&subtotal=${subtotal}`, { signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(data.error);
      setQuote(data);
      setCheckedPin(next);
      rememberPin(next);
    } catch {
      if (!controller.signal.aborted) { setQuote(null); setCheckedPin(""); setFailed(true); }
    } finally {
      if (!controller.signal.aborted) setChecking(false);
    }
  }

  useEffect(() => { if (checkedPin) check(checkedPin); }, [subtotal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => request.current?.abort(), []);

  function edit(value: string) {
    const next = value.replace(/\D/g, "").slice(0, 6);
    setPin(next);
    if (next === checkedPin) return;
    request.current?.abort(); setChecking(false); setQuote(null); setCheckedPin(""); setFailed(false);
    if (next.length === 6) check(next);
  }

  /** Check the PIN from earlier in this visit, if any. */
  function restore() {
    const saved = rememberedPin();
    if (saved && !pin) { setPin(saved); check(saved); }
  }

  return { pin, edit, check: () => check(pin), checkPin: check, restore, checkedPin, quote, checking, failed };
}
