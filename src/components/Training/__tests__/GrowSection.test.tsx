import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import { useOptionalWishlist } from "@/app/context/WishlistContext";
import GrowSection from "../GrowSection";

jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
jest.mock("@/app/context/WishlistContext", () => ({ useOptionalWishlist: jest.fn() }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));

let nextId = 1;
const make = (slug: string, title: string, category: { slug: string; title: string }, price: number) => ({
  id: nextId++, slug, title, description: "", price, discountedPrice: undefined, measurementValue: 1, measurementType: "kg",
  stockQuantity: 20, inStock: true, featured: false, imgs: { previews: [`/images/${slug}.png`], thumbnails: [] },
  specifications: [], howToConsume: [], additionalInfo: [], categories: [{ category: { id: 1, ...category } }],
});
const grow = { slug: "grow-your-own", title: "Grow Your Own" };
const seeds = { slug: "seeds", title: "Seeds" };
const catalogue = [
  make("chia-seeds", "Chia Seeds", seeds, 249),
  make("oyster-seed-or-spawn", "Oyster Seed ('or Spawn')", grow, 156),
  make("ready-to-fruit-oyster-mushroom-grow-bag", "Ready to Fruit Oyster Mushroom Grow Bag", grow, 129),
];

const wishlist = { isInWishlist: jest.fn(() => false), addToWishlist: jest.fn(async () => true), removeFromWishlist: jest.fn(async () => true) };

function renderSection(result: { products: unknown[]; loading?: boolean; error?: string | null }) {
  (useProducts as jest.Mock).mockReturnValue({ loading: false, error: null, ...result });
  const store = configureStore({ reducer: { cartReducer } });
  const view = render(<Provider store={store}><GrowSection /></Provider>);
  return { store, ...view };
}

beforeEach(() => {
  (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated", data: null });
  (useOptionalWishlist as jest.Mock).mockReturnValue(wishlist);
});

describe("Grow your own section on /training", () => {
  it("shows only spawn and grow bags, with the not-for-eating note and the bulk enquiry link", () => {
    renderSection({ products: catalogue });
    expect(useProducts).toHaveBeenCalledWith({ limit: 100 });
    const section = screen.getByRole("region", { name: "Start growing at home" });
    expect(section).toHaveAttribute("id", "grow");
    expect(within(section).getAllByRole("heading", { level: 3 }).map(h => h.textContent))
      .toEqual(["Oyster Seed ('or Spawn')", "Ready to Fruit Oyster Mushroom Grow Bag"]);
    expect(within(section).queryByText("Chia Seeds")).not.toBeInTheDocument();
    expect(within(section).getByText(/not for eating/)).toBeInTheDocument();
    // Each card names its kind before the pack size, as in the shop.
    expect(within(section).getAllByText((_, el) => el?.tagName === "P" && el.textContent === "Grow your own·1 kg")).toHaveLength(2);
    expect(within(section).getByRole("link", { name: "Buying spawn for a farm? Ask us about bulk orders" }))
      .toHaveAttribute("href", "/contact?subject=Bulk%20spawn");
    expect(section.textContent).not.toMatch(/shelf life|deliver|bulk price/i);
  });

  it("finds spawn still filed under Seeds by its name", () => {
    renderSection({ products: [make("oyster-seed-or-spawn", "Oyster Seed ('or Spawn')", seeds, 156)] });
    expect(screen.getByRole("heading", { name: "Oyster Seed ('or Spawn')" })).toBeInTheDocument();
  });

  it("adds a pack to the bag and offers the wishlist heart like the shop", () => {
    const { store } = renderSection({ products: catalogue });
    const card = screen.getByRole("heading", { name: "Oyster Seed ('or Spawn')" }).closest("article")!;
    fireEvent.click(within(card).getByRole("button", { name: "Add Oyster Seed ('or Spawn') to bag" }));
    expect(store.getState().cartReducer.items).toEqual([expect.objectContaining({ slug: "oyster-seed-or-spawn", quantity: 1, price: 156 })]);
    expect(within(card).getByRole("button", { name: "Save Oyster Seed ('or Spawn') to wishlist" })).toBeInTheDocument();
  });

  it("shows a skeleton while loading and hides itself with no grow products or on error", () => {
    const loading = renderSection({ products: [], loading: true });
    expect(loading.container.querySelector("[aria-hidden='true']")).not.toBeNull();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    loading.unmount();

    const none = renderSection({ products: catalogue.slice(0, 1) });
    expect(none.container).toBeEmptyDOMElement();
    none.unmount();

    const failed = renderSection({ products: [], error: "Failed to fetch products" });
    expect(failed.container).toBeEmptyDOMElement();
  });
});
