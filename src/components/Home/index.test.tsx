import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import Home from "./index";

jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));

const sampleProducts = [
  { id: 1, slug: "premium-walnuts", title: "Premium Walnuts", category: "dry-fruits" },
  { id: 2, slug: "cumin-seeds", title: "Cumin Seeds", category: "spices" },
  { id: 3, slug: "king-oyster-eryngii", title: "King Oyster", category: "edible" },
  { id: 4, slug: "chia-seeds", title: "Chia Seeds", category: "seeds" },
  // Production may still file spawn under Seeds, and a grow bag may carry only the grow category.
  { id: 5, slug: "oyster-seed-or-spawn", title: "Oyster Seed ('or Spawn')", category: "seeds" },
  { id: 6, slug: "fruiting-block", title: "Oyster Fruiting Block", category: "grow-your-own,seeds" },
].map(({ category, ...product }) => ({
  ...product, price: 149, measurementValue: 200, measurementType: "gm", stockQuantity: 2,
  inStock: true, imgs: { previews: [], thumbnails: [] }, categories: category.split(",").map(slug => ({ category: { slug } })),
}));

function openHome() {
  const store = configureStore({ reducer: { cartReducer } });
  (useProducts as jest.Mock).mockReturnValue({ products: sampleProducts, loading: false, error: null });
  render(<Provider store={store}><Home /></Provider>);
  return store;
}

describe("Himalayan pantry homepage", () => {
  it("shows nationwide pantry goods and filters the shelf without leaving the page", () => {
    openHome();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/The Himalayan.*Pantry/);
    expect(screen.getByRole("heading", { name: "Premium Walnuts" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "King Oyster" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Spices" }));
    expect(screen.getByRole("heading", { name: "Cumin Seeds" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Premium Walnuts" })).toBeNull();
  });

  it("keeps spawn and grow bags off the pantry shelf, even when they are filed under Seeds", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "Seeds" }));
    expect(screen.getByRole("heading", { name: "Chia Seeds" })).toBeTruthy();
    const shelf = within(document.getElementById("pantry")!);
    expect(shelf.queryByRole("heading", { name: /Spawn/ })).toBeNull();
    expect(shelf.queryByRole("heading", { name: "Oyster Fruiting Block" })).toBeNull();
  });

  it("adds, caps, and removes a real cart line with its product link intact", () => {
    const store = openHome();
    fireEvent.click(screen.getByRole("button", { name: "Add Premium Walnuts to bag" }));
    fireEvent.click(screen.getByRole("button", { name: "Add one Premium Walnuts" }));
    expect(store.getState().cartReducer.items[0]).toMatchObject({ slug: "premium-walnuts", quantity: 2 });
    expect((screen.getByRole("button", { name: "Add one Premium Walnuts" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Remove one Premium Walnuts" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove one Premium Walnuts" }));
    expect(store.getState().cartReducer.items).toHaveLength(0);
  });
});
