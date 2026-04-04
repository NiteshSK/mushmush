import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  stockQuantity?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs, stockQuantity } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        const maxQty = stockQuantity ?? existingItem.stockQuantity ?? Infinity;
        existingItem.quantity = Math.min(existingItem.quantity + quantity, maxQty);
        if (stockQuantity !== undefined) existingItem.stockQuantity = stockQuantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity: stockQuantity !== undefined ? Math.min(quantity, stockQuantity) : quantity,
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
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

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
} = cart.actions;
export default cart.reducer;
