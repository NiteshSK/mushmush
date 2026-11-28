import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Provider } from "react-redux";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { rupees } from "../Pantry/catalogue";
import Cart from "./index";
import BagDrawer from "./BagDrawer";

jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
// The shared jest setup drops every Link prop except href; keep onClick and class for these tests.
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

const product = (id: number, slug: string, title: string, category: string, extra = {}) => ({
  id, slug, title, description: "", price: 149, discountedPrice: null, measurementValue: 200, measurementType: "gm", stockQuantity: 50,
  inStock: true, imgs: { previews: [`/images/${slug}.png`], thumbnails: [] }, categories: [{ category: { id: 1, slug: category, title: category } }], ...extra,
});
const catalogue = [
  product(50, "cumin-seeds", "Cumin Seeds", "spices"),
  product(14, "king-oyster-eryngii", "King Oyster (Eryngii)", "edible", { price: 259 }),
  product(16, "grow-bag", "Oyster Grow Bag", "seeds", { price: 129, stockQuantity: 3 }),
];
// Bag lines carry no category or pack size; those come from the catalogue.
const line = (p: ReturnType<typeof product>, quantity: number, extra = {}) =>
  ({ id: p.id, slug: p.slug, title: p.title, price: p.price, quantity, stockQuantity: p.stockQuantity, imgs: p.imgs, ...extra });

function renderWith(ui: React.ReactElement, items: ReturnType<typeof line>[], products = catalogue) {
  (useProducts as jest.Mock).mockReturnValue({ products, loading: false, error: null });
  const store = configureStore({ reducer: { cartReducer }, preloadedState: { cartReducer: { items } } });
  render(<Provider store={store}>{ui}</Provider>);
  return store;
}
const total = () => screen.getByTestId("bag-total").textContent;

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
  sessionStorage.clear();
});

describe("/cart", () => {
  it("shows each pack with size, price, delivery scope and line total", () => {
    renderWith(<Cart />, [line(catalogue[0], 2), line(catalogue[1], 1)]);
    const cumin = screen.getByTestId("bag-line-cumin-seeds");
    expect(within(cumin).getByRole("link", { name: "Cumin Seeds" })).toHaveAttribute("href", "/shop-details/cumin-seeds");
    expect(cumin).toHaveTextContent("200 g");
    expect(cumin).toHaveTextContent("₹149 each");
    expect(cumin).toHaveTextContent("Ships across India");
    expect(cumin).toHaveTextContent("Line total ₹298");
    expect(screen.getByTestId("bag-line-king-oyster-eryngii")).toHaveTextContent("Fresh · Dehradun only");
    expect(total()).toBe(rupees.format(298 + 259 + CONVENIENCE_FEE));
    expect(screen.getByText("Total before delivery")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to checkout" })).toHaveAttribute("href", "/checkout");
  });

  it("updates the quantity, line total and total together", () => {
    const store = renderWith(<Cart />, [line(catalogue[0], 2)]);
    fireEvent.click(screen.getByRole("button", { name: "Remove one Cumin Seeds" }));
    expect(store.getState().cartReducer.items[0].quantity).toBe(1);
    expect(screen.getByTestId("bag-line-cumin-seeds")).toHaveTextContent("Line total ₹149");
    expect(total()).toBe(rupees.format(149 + CONVENIENCE_FEE));
  });

  it("caps the quantity at the stock", () => {
    renderWith(<Cart />, [line(catalogue[2], 2)]);
    fireEvent.click(screen.getByRole("button", { name: "Add one Oyster Grow Bag" }));
    expect(screen.getByLabelText("3 in bag")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oyster Grow Bag: no more in stock" })).toBeDisabled();
    expect(screen.getByTestId("bag-line-grow-bag")).toHaveTextContent("Only 3 left");
  });

  it("caps an older saved line by live stock from the catalogue", () => {
    renderWith(<Cart />, [line(catalogue[2], 5, { stockQuantity: undefined })]);
    expect(screen.getByTestId("bag-line-grow-bag")).toHaveTextContent("Only 3 left. Reduce the quantity to 3.");
    expect(screen.getByRole("button", { name: "Oyster Grow Bag: no more in stock" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Go to checkout" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove one Oyster Grow Bag" }));
    expect(screen.getByLabelText("3 in bag")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to checkout" })).toBeInTheDocument();
  });

  it("requires a verified stock count even when the bag has an older count", () => {
    renderWith(<Cart />, [line(catalogue[0], 1)], [{ ...catalogue[0], stockQuantity: NaN }]);
    expect(screen.getByRole("button", { name: "Cumin Seeds: stock not verified" })).toBeDisabled();
    expect(screen.getByText("We couldn’t verify stock. Refresh or try again.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Go to checkout" })).not.toBeInTheDocument();
  });

  it("lets shoppers remove a product the live catalogue no longer carries", () => {
    renderWith(<Cart />, [line(catalogue[0], 1)], []);
    expect(screen.getByText("Sold out. Remove it to continue.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Go to checkout" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Cumin Seeds from bag" }));
    expect(screen.getByRole("heading", { name: "Your bag is empty." })).toBeInTheDocument();
  });

  it("gives an empty bag a way back to the shop", () => {
    renderWith(<Cart />, []);
    expect(screen.getByRole("heading", { name: "Your bag is empty." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });

  it("adds the delivery fee for the PIN and names a fresh line that cannot go there", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ deliverable: true, pincode: "110001", zoneName: "Delhi NCR", shippingFee: 80, estimatedDays: "2-4 days", freeAbove: 1999 }) });
    const store = renderWith(<Cart />, [line(catalogue[1], 1), line(catalogue[0], 2)]);
    fireEvent.change(screen.getByLabelText("Delivery PIN code"), { target: { value: "110001" } });
    const conflict = await screen.findByTestId("fresh-conflict");
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(`/api/shipping/check?pincode=110001&subtotal=${259 + 298}`);
    expect(conflict).toHaveTextContent("King Oyster (Eryngii) is a fresh mushroom, delivered only in Dehradun. We can’t deliver it to 110001.");
    expect(conflict).not.toHaveTextContent("Cumin");
    expect(total()).toBe(rupees.format(259 + 298 + 80 + CONVENIENCE_FEE));

    fireEvent.click(within(conflict).getByRole("button", { name: "Remove King Oyster (Eryngii)" }));
    expect(store.getState().cartReducer.items).toEqual([expect.objectContaining({ slug: "cumin-seeds", quantity: 2 })]);
    await waitFor(() => expect(screen.queryByTestId("fresh-conflict")).not.toBeInTheDocument());
  });

  it("confirms fresh delivery for 248001", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ deliverable: true, pincode: "248001", zoneName: "Local Dehradun", shippingFee: 50 }) });
    renderWith(<Cart />, [line(catalogue[1], 1)]);
    fireEvent.change(screen.getByLabelText("Delivery PIN code"), { target: { value: "248001" } });
    await screen.findByText("Delivers to 248001.");
    expect(screen.queryByTestId("fresh-conflict")).not.toBeInTheDocument();
  });
});

describe("bag drawer", () => {
  it("lists the bag with the convenience fee and closes on Escape", () => {
    const onClose = jest.fn();
    renderWith(<BagDrawer onClose={onClose} />, [line(catalogue[0], 2)]);
    const drawer = screen.getByRole("dialog", { name: "Your bag" });
    expect(drawer).toHaveTextContent("Line total ₹298");
    expect(drawer).toHaveTextContent(`Convenience fee${rupees.format(CONVENIENCE_FEE)}`);
    expect(within(drawer).getByRole("link", { name: "Go to checkout" })).toHaveAttribute("href", "/checkout");
    act(() => { drawer.dispatchEvent(new Event("cancel", { cancelable: true })); });
    expect(onClose).toHaveBeenCalled();
  });

  it("offers the shop when the bag is empty", () => {
    renderWith(<BagDrawer onClose={jest.fn()} />, []);
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });
});
