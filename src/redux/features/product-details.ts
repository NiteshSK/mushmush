import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState: InitialState = {
  value: {
    title: "",
    reviews: 0,
    price: 0,
    discountedPrice: 0,
    id: 0,
    imgs: { thumbnails: [], previews: [] },
    description: "",
    specifications: [],
    howToConsume: [],
    additionalInfo: [],
    reviewsList: [],
  },
};

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (state, action: PayloadAction<Product>) => {
      state.value = action.payload;
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;
