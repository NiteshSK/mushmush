import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import RecentlyViewed from "./index";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: jest.fn() }), usePathname: () => "/recently-viewed" }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
jest.mock("../NotifyMeModal", () => ({ __esModule: true, default: () => null }));

// /api/recently-viewed returns raw rows: no sale price and no pack stock.
const raw = { id: 41, slug: "premium-walnuts", title: "Premium Walnuts", description: "", price: 449, measurementValue: 250, measurementType: "gm",
  inStock: true, quantity: 10000, imgs: { previews: ["/images/walnuts.png"], thumbnails: [] }, categories: [{ category: { id: 3, slug: "dry-fruits", title: "Dry Fruits" } }] };
const listed = { ...raw, discountedPrice: 399, hasDiscount: true, stockQuantity: 3 };

function openRecent(items: unknown[], catalogue: { products: unknown[]; loading: boolean }) {
  (useSession as jest.Mock).mockReturnValue({ data: { user: { id: "u1" } }, status: "authenticated" });
  (useProducts as jest.Mock).mockReturnValue({ ...catalogue, error: null });
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => ({ items: items.map(product => ({ product })) }) });
  const store = configureStore({ reducer: { cartReducer } });
  const view = render(<Provider store={store}><RecentlyViewed /></Provider>);
  return { store, view };
}

describe("Recently viewed page", () => {
  it("sends a signed-out visitor to sign-in with a return URL", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
    (useProducts as jest.Mock).mockReturnValue({ products: [], loading: true, error: null });
    render(<Provider store={configureStore({ reducer: { cartReducer } })}><RecentlyViewed /></Provider>);
    expect(replace).toHaveBeenCalledWith("/auth/signin?callbackUrl=/recently-viewed");
  });

  it("shows the listing price and stock limit, not the raw row, on the card and in the bag", async () => {
    const { store } = openRecent([raw], { products: [listed], loading: false });
    const card = (await screen.findByRole("heading", { name: "Premium Walnuts" })).closest("article")!;
    expect(within(card).getByText("₹399")).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Add Premium Walnuts to bag" }));
    expect(store.getState().cartReducer.items[0]).toEqual(expect.objectContaining({ slug: "premium-walnuts", discountedPrice: 399, stockQuantity: 3 }));
  });

  it("waits for listing prices before showing cards", async () => {
    const { view } = openRecent([raw], { products: [], loading: true });
    await screen.findByLabelText("Loading recently viewed products");
    expect(screen.queryByText("₹449")).toBeNull();
    (useProducts as jest.Mock).mockReturnValue({ products: [listed], loading: false, error: null });
    view.rerender(<Provider store={configureStore({ reducer: { cartReducer } })}><RecentlyViewed /></Provider>);
    expect(await screen.findByText("₹399")).toBeInTheDocument();
  });

  it("explains an empty history and links to the shop", async () => {
    openRecent([], { products: [listed], loading: false });
    expect(await screen.findByRole("heading", { name: "Nothing viewed yet." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });
});
