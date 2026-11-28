import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { isPackQuantity, MAX_ORDER_PACKS, sellablePackLimit } from "@/lib/inventory";

type InitialState = {
  items: CartItem[];
  /**
   * Lower-case email of the account that `items` belong to. `null` is a guest
   * bag. `undefined` is a bag persisted before bags had owners.
   */
  owner?: string | null;
  /**
   * Bags of other accounts that used this browser, keyed by lower-case email,
   * least recently stashed first. Persisted bags from before this field lack it.
   */
  saved?: Record<string, CartItem[]>;
};

export type CartState = InitialState;

type CartItem = {
  id: number;
  title: string;
  slug?: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  stockQuantity?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

/** Product details that `refreshItemDetails` copies into bag lines. */
export type ItemDetails = {
  id: number;
  slug?: string | null;
  stockQuantity?: number | null;
};

/** Most accounts whose bags this browser keeps while another account (or a guest) shops. */
export const MAX_SAVED_BAGS = 5;

const initialState: InitialState = {
  items: [],
  owner: null,
  saved: {},
};

const toOwner = (email: string | null | undefined) => email?.trim().toLowerCase() || null;

/** Cap a quantity to the stock, but keep at least one so a line never shows 0. */
function capToStock(quantity: number, stock?: number) {
  const safeQuantity = isPackQuantity(quantity) ? quantity : 1;
  return Math.max(1, Math.min(safeQuantity, stock ?? safeQuantity));
}

function restoreLines(lines: CartItem[]) {
  return lines.filter(item => item && isPackQuantity(item.id)).map(item => {
    const stockQuantity = sellablePackLimit(item) ?? undefined;
    return { ...item, stockQuantity, quantity: capToStock(item.quantity, stockQuantity) };
  });
}

export function restoreCartState(state: CartState | null): CartState {
  if (!state) return initialState;
  const items = restoreLines(Array.isArray(state.items) ? state.items : []);
  const saved = Object.fromEntries(Object.entries(state.saved ?? {}).map(([owner, lines]) =>
    [owner, restoreLines(Array.isArray(lines) ? lines : [])]));
  return { ...state, items, saved };
}

/** Put a bag away under its account. An empty bag removes the entry. */
function stash(state: InitialState, owner: string, items: CartItem[]) {
  const saved = (state.saved ??= {});
  delete saved[owner]; // re-adding moves the account to the most recent end
  if (items.length > 0) saved[owner] = items;
  const owners = Object.keys(saved);
  for (let i = 0; i < owners.length - MAX_SAVED_BAGS; i++) delete saved[owners[i]];
}

/** Take an account's bag out of the saved bags. */
function unstash(state: InitialState, owner: string): CartItem[] {
  const saved = (state.saved ??= {});
  const items = saved[owner] ?? [];
  delete saved[owner];
  return items;
}

/** Add `incoming` lines to `base`. Same products add up, capped by stock. */
function mergeBags(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const merged = base.slice();
  for (const item of incoming) {
    const index = merged.findIndex((line) => line.id === item.id);
    if (index === -1) {
      merged.push({ ...item, quantity: capToStock(item.quantity, item.stockQuantity) });
      continue;
    }
    const line = merged[index];
    const stockQuantity = sellablePackLimit(item) ?? sellablePackLimit(line) ?? undefined;
    merged[index] = {
      ...line,
      ...item,
      slug: item.slug ?? line.slug,
      imgs: item.imgs ?? line.imgs,
      stockQuantity,
      quantity: capToStock(Math.min(MAX_ORDER_PACKS, line.quantity + item.quantity), stockQuantity),
    };
  }
  return merged;
}

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, slug, price, quantity, discountedPrice, imgs, stockQuantity } =
        action.payload;
      if (!isPackQuantity(id) || !isPackQuantity(quantity)) return;
      const existingItem = state.items.find((item) => item.id === id);
      const max = sellablePackLimit({ stockQuantity: stockQuantity === undefined ? existingItem?.stockQuantity : stockQuantity });
      if (!max) return;

      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + quantity, max);
        if (slug) existingItem.slug = slug;
        if (stockQuantity !== undefined) existingItem.stockQuantity = stockQuantity;
      } else {
        state.items.push({
          id,
          title,
          slug,
          price,
          quantity: Math.min(quantity, max),
          discountedPrice,
          stockQuantity,
          imgs,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number; stockQuantity?: number }>
    ) => {
      const { id, quantity, stockQuantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (!existingItem || !isPackQuantity(quantity)) return;
      const max = sellablePackLimit({ stockQuantity: stockQuantity === undefined ? existingItem.stockQuantity : stockQuantity });
      if (stockQuantity !== undefined) existingItem.stockQuantity = max ?? undefined;
      existingItem.quantity = max === null ? Math.min(quantity, existingItem.quantity) : capToStock(quantity, max);
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
    /**
     * Replace bag prices with the server's prices after checkout reports a
     * price change (409 TOTAL_MISMATCH), so the bag, the summary and the
     * order agree.
     */
    applyServerPrices: (
      state,
      action: PayloadAction<{ productId: number; listPrice: number; unitPrice: number }[]>
    ) => {
      for (const line of action.payload) {
        const item = state.items.find((i) => i.id === line.productId);
        if (!item) continue;
        item.price = line.listPrice;
        item.discountedPrice = line.unitPrice < line.listPrice ? line.unitPrice : undefined;
      }
    },
    /**
     * Show the bag of the account that is signed in now (email), or a guest
     * bag (null). Dispatch only when the session is known, never while it loads.
     * - A guest or pre-owner bag that signs in becomes that account's bag,
     *   merged with the account's saved bag.
     * - Switching accounts puts the previous account's bag away and loads the
     *   new account's saved bag, or an empty one.
     * - Signing out puts the account's bag away and shows an empty guest bag.
     */
    syncCartOwner: (state, action: PayloadAction<string | null | undefined>) => {
      const next = toOwner(action.payload);
      const current = state.owner;
      if (current === next) return;

      if (next === null) {
        if (typeof current === "string") {
          stash(state, current, state.items);
          state.items = [];
        }
        state.owner = null;
        return;
      }

      if (typeof current === "string") {
        stash(state, current, state.items);
        state.items = unstash(state, next);
      } else {
        state.items = mergeBags(unstash(state, next), state.items);
      }
      state.owner = next;
    },
    /**
     * Fill in product details that older bag lines lack (slug for links,
     * stockQuantity for limits) in the visible and saved bags, and cap
     * quantities to the current stock. Prices stay as they are.
     */
    refreshItemDetails: (state, action: PayloadAction<ItemDetails[]>) => {
      const details = new Map<number, ItemDetails>();
      action.payload.forEach((product) => details.set(product.id, product));
      const refresh = (items: CartItem[]) => {
        for (const item of items) {
          const product = details.get(item.id);
          if (!product) continue;
          if (product.slug) item.slug = product.slug;
          const limit = sellablePackLimit(product);
          if (limit !== null) {
            item.stockQuantity = limit;
            item.quantity = capToStock(item.quantity, limit);
          }
        }
      };
      refresh(state.items);
      Object.keys(state.saved ?? {}).forEach((owner) => refresh(state.saved![owner]));
    },
  },
});

/** Ids of lines in any bag (visible or saved) that lack a slug or a stock quantity. */
export const missingDetailIds = (cart: CartState): number[] => {
  const ids: number[] = [];
  const bags = [cart.items].concat(Object.keys(cart.saved ?? {}).map((owner) => cart.saved![owner]));
  for (const bag of bags) {
    for (const item of bag) {
      if ((!item.slug || sellablePackLimit(item) === null) && ids.indexOf(item.id) === -1) ids.push(item.id);
    }
  }
  return ids;
};

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectCartOwner = (state: RootState) => state.cartReducer.owner;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    const price = item.discountedPrice || item.price;
    return total + price * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  applyServerPrices,
  syncCartOwner,
  refreshItemDetails,
} = cart.actions;
export default cart.reducer;
