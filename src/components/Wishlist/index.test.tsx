import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import cartReducer from "@/redux/features/cart-slice";
import { Wishlist } from "./index";

const replace = jest.fn();
const refreshWishlist = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: jest.fn() }), usePathname: () => "/wishlist" }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
jest.mock("@/app/context/WishlistContext", () => ({ useOptionalWishlist: () => ({ refreshWishlist, items: [], loading: false, isInWishlist: () => true }) }));
jest.mock("../NotifyMeModal", () => ({ __esModule: true, default: ({ productTitle }: { productTitle: string }) => <div role="dialog">Notify me about {productTitle}</div> }));

const product = (id: number, slug: string, title: string, extra = {}) => ({
  id, slug, title, description: "", price: 449, discountedPrice: null, hasDiscount: false, measurementValue: 250, measurementType: "gm",
  stockQuantity: 12, inStock: true, imgs: { previews: [`/images/${slug}.png`], thumbnails: [] },
  categories: [{ category: { id: 1, slug: "dry-fruits", title: "Dry Fruits" } }], ...extra,
});
const walnuts = product(41, "premium-walnuts", "Premium Walnuts", { discountedPrice: 399, hasDiscount: true, stockQuantity: 3 });
const apricots = product(38, "dried-apricots", "Dried Apricots", { inStock: false, stockQuantity: 0 });

const ok = (body: unknown = {}) => Promise.resolve({ ok: true, status: 200, json: async () => body });

async function openWishlist(products = [walnuts, apricots]) {
  (useSession as jest.Mock).mockReturnValue({ data: { user: { id: "u1", email: "shopper@example.test" } }, status: "authenticated" });
  (global.fetch as jest.Mock).mockImplementation((url: string, init?: RequestInit) =>
    !init?.method ? ok({ items: products.map(item => ({ id: `w${item.id}`, product: item })) }) : ok());
  const store = configureStore({ reducer: { cartReducer } });
  render(<Provider store={store}><Wishlist /></Provider>);
  await screen.findAllByRole("heading", { level: products.length ? 3 : 2 });
  return store;
}
const card = (title: string) => screen.getByRole("heading", { name: title }).closest("li")!;

describe("Wishlist page", () => {
  it("sends a signed-out visitor to sign-in with a return URL", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
    render(<Provider store={configureStore({ reducer: { cartReducer } })}><Wishlist /></Provider>);
    expect(replace).toHaveBeenCalledWith("/auth/signin?callbackUrl=/wishlist");
  });

  it("uses the pantry card and adds the sale price, slug and stock limit to the bag", async () => {
    const store = await openWishlist();
    const saved = card("Premium Walnuts");
    expect(within(saved).getByRole("link")).toHaveAttribute("href", "/shop-details/premium-walnuts");
    expect(within(saved).getByText("₹399")).toBeInTheDocument();
    fireEvent.click(within(saved).getByRole("button", { name: "Add Premium Walnuts to bag" }));
    expect(store.getState().cartReducer.items[0]).toEqual(expect.objectContaining({ id: 41, slug: "premium-walnuts", discountedPrice: 399, stockQuantity: 3, quantity: 1 }));
    fireEvent.click(within(saved).getByRole("button", { name: "Add one Premium Walnuts" }));
    fireEvent.click(within(saved).getByRole("button", { name: "Add one Premium Walnuts" }));
    expect(within(saved).getByRole("button", { name: "Add one Premium Walnuts" })).toBeDisabled();
    expect(within(card("Dried Apricots")).getByRole("button", { name: /sold out/ })).toBeInTheDocument();
  });

  it("keeps Remove outside the product link and offers Undo", async () => {
    await openWishlist();
    const remove = within(card("Premium Walnuts")).getByRole("button", { name: "Remove Premium Walnuts from your wishlist" });
    expect(remove.closest("a")).toBeNull();
    expect(remove.closest("article")).toBeNull();
    await act(async () => { fireEvent.click(remove); });
    expect(global.fetch).toHaveBeenCalledWith("/api/wishlist?productId=41", { method: "DELETE" });
    expect(screen.queryByRole("heading", { name: "Premium Walnuts" })).toBeNull();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Premium Walnuts removed from your wishlist.");
    expect(document.activeElement).toBe(status);
    expect(refreshWishlist).toHaveBeenCalled();

    await act(async () => { fireEvent.click(within(status).getByRole("button", { name: "Undo" })); });
    expect(global.fetch).toHaveBeenCalledWith("/api/wishlist", expect.objectContaining({ method: "POST", body: JSON.stringify({ productId: 41 }) }));
    expect(status).toHaveTextContent("Premium Walnuts is back in your wishlist.");
  });

  it("points an empty wishlist back to the shop", async () => {
    await openWishlist([]);
    expect(screen.getByRole("heading", { name: "Your wishlist is empty." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });
});
