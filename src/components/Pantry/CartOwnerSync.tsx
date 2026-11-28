"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { type AppDispatch, useAppSelector } from "@/redux/store";
import { missingDetailIds, refreshItemDetails, syncCartOwner, type ItemDetails } from "@/redux/features/cart-slice";
import { productsApi } from "@/lib/api";

/**
 * Keeps the bag with the account it belongs to, on every route: a guest bag
 * follows the shopper into their account, a reload keeps the bag, and each
 * account on a shared browser gets its own bag back.
 *
 * Mount it once, inside the session provider and only after redux-persist has
 * rehydrated. Before that the rehydrated bag would overwrite what it sets.
 *
 * It also fills in slug and stock for bag lines saved by older versions.
 */
export default function CartOwnerSync() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const email = status === "authenticated" ? session?.user?.email ?? null : null;

  useEffect(() => {
    if (status === "loading") return;
    dispatch(syncCartOwner(email));
  }, [status, email, dispatch]);

  const missing = useAppSelector((state) => missingDetailIds(state.cartReducer).join(","));
  const lookedUp = useRef(new Set<number>());

  useEffect(() => {
    // Look each product up once per page load, so a product that no longer exists does not cause repeated requests.
    const ids = missing ? missing.split(",").map(Number).filter((id) => !lookedUp.current.has(id)) : [];
    if (ids.length === 0) return;
    ids.forEach((id) => lookedUp.current.add(id));
    productsApi.getAll({ ids: ids.join(",") })
      .then((data: { products?: ItemDetails[] } | null) => {
        if (!Array.isArray(data?.products)) return;
        dispatch(refreshItemDetails(data.products.map(({ id, slug, stockQuantity }) => ({ id, slug, stockQuantity }))));
      })
      .catch(() => {
        // Keep the bag as it is. The next page load tries again.
      });
  }, [missing, dispatch]);

  return null;
}
