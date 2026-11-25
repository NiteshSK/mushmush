import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { act, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import cartReducer, { addItemToCart, removeItemFromCart, type CartState } from "@/redux/features/cart-slice";
import CartOwnerSync from "./CartOwnerSync";

const A = "shopper-a@example.test";
const cumin = { id: 50, title: "Cumin Seeds", slug: "cumin-seeds", price: 149, quantity: 2, stockQuantity: 50 };

type Session = { status: "loading" | "authenticated" | "unauthenticated"; email?: string };
const setSession = ({ status, email }: Session) =>
  (useSession as jest.Mock).mockReturnValue({ status, data: email ? { user: { email } } : null });

function mount(cart: CartState, session: Session) {
  const store = configureStore({ reducer: combineReducers({ cartReducer }), preloadedState: { cartReducer: cart } });
  setSession(session);
  const view = render(<Provider store={store}><CartOwnerSync /></Provider>);
  const rerender = (next: Session) => { setSession(next); view.rerender(<Provider store={store}><CartOwnerSync /></Provider>); };
  return { store, rerender };
}

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe("CartOwnerSync", () => {
  it("waits while the session loads, then gives a guest bag to the account", () => {
    const { store, rerender } = mount({ items: [cumin], owner: null, saved: {} }, { status: "loading" });
    expect(store.getState().cartReducer.owner).toBeNull();
    rerender({ status: "authenticated", email: A });
    expect(store.getState().cartReducer).toMatchObject({ owner: A, items: [cumin] });
  });

  it("keeps a signed-in bag through a reload", () => {
    const { store, rerender } = mount({ items: [cumin], owner: A, saved: {} }, { status: "loading" });
    rerender({ status: "authenticated", email: A });
    expect(store.getState().cartReducer.items).toEqual([cumin]);
  });

  it("puts the bag away when the session becomes unauthenticated on any page", () => {
    const { store, rerender } = mount({ items: [cumin], owner: A, saved: {} }, { status: "authenticated", email: A });
    rerender({ status: "unauthenticated" });
    expect(store.getState().cartReducer).toEqual({ items: [], owner: null, saved: { [A]: [cumin] } });
  });

  it("fetches products once to fill in slug and stock for older lines", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ products: [{ id: 50, slug: "cumin-seeds", stockQuantity: 2, price: 1, discountedPrice: 1 }] }),
    });
    const old = { id: 50, title: "Cumin Seeds", price: 149, quantity: 3 };
    const { store, rerender } = mount({ items: [old] }, { status: "unauthenticated" });
    await waitFor(() => expect(store.getState().cartReducer.items[0]).toMatchObject({ slug: "cumin-seeds", stockQuantity: 2, quantity: 2, price: 149 }));
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("/api/products?limit=100");
    rerender({ status: "authenticated", email: A });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("does not fetch when every line has slug and stock", () => {
    mount({ items: [cumin], owner: null, saved: {} }, { status: "unauthenticated" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("looks each product up once, so a product that no longer exists does not repeat the request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ products: [] }) });
    const { store } = mount({ items: [{ id: 999, title: "Gone", price: 1, quantity: 1 }] }, { status: "unauthenticated" });
    await act(async () => { await Promise.resolve(); });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // A legacy page adds a line without a slug: one more lookup, for that product only.
    act(() => { store.dispatch(addItemToCart({ id: 7, title: "Legacy add", price: 1, quantity: 1 })); });
    await act(async () => { await Promise.resolve(); });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    act(() => { store.dispatch(removeItemFromCart(7)); });
    await act(async () => { await Promise.resolve(); });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
