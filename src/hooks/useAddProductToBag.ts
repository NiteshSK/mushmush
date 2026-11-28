import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { sellablePackLimit } from "@/lib/inventory";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import type { Product } from "@/types/product";

export function useAddProductToBag(product: Product) {
  const dispatch = useDispatch<AppDispatch>();
  const quantity = useAppSelector(state =>
    state.cartReducer.items.find(item => item.id === product.id)?.quantity ?? 0
  );

  return () => {
    const stockQuantity = sellablePackLimit(product);
    if (stockQuantity === null) {
      toast.error("Stock is unavailable. Please try again later.");
      return;
    }
    if (quantity >= stockQuantity) {
      toast.error(stockQuantity ? "Your bag already contains all available packs." : "This item is sold out.");
      return;
    }
    const { id, title, slug, price, discountedPrice, imgs } = product;
    dispatch(addItemToCart({ id, title, slug, price, discountedPrice, imgs, quantity: 1, stockQuantity }));
    toast.success("Added to cart!");
  };
}
