import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { signOut, useSession } from "next-auth/react";
import cartReducer from "@/redux/features/cart-slice";
import MyAccount from "./index";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: jest.fn() }), usePathname: () => "/my-account" }));
// The shared jest setup drops every Link prop except href; keep aria attributes for these tests.
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

const profile = { name: "Test Shopper", email: "shopper@example.test", phone: null, role: "CUSTOMER", createdAt: "2026-11-01T00:00:00.000Z" };
const orders = [
  { id: "o1", orderNumber: "ORD-1", status: "PAYMENT_RECEIVED", total: 509, createdAt: "2026-11-23T10:00:00.000Z", orderItems: [{ id: "i1", quantity: 1, price: 449, product: { title: "Premium Walnuts" } }] },
  { id: "o2", orderNumber: "ORD-2", status: "DELIVERED", total: 707, createdAt: "2026-11-04T10:00:00.000Z", orderItems: [{ id: "i2", quantity: 2, price: 199, product: { title: "Golden Raisins" } }] },
];
const address = { id: "a1", street: "12 Rajpur Road", city: "Dehradun", state: "Uttarakhand", zip: "248001", country: "India", type: "BOTH", isDefault: true };

const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: async () => body });

async function openOverview() {
  (useSession as jest.Mock).mockReturnValue({ data: { user: { id: "u1", name: "Test Shopper", email: profile.email } }, status: "authenticated" });
  (global.fetch as jest.Mock).mockImplementation((url: string, init?: RequestInit) =>
    url === "/api/user/profile" && init?.method === "PATCH" ? ok({ ...profile, ...JSON.parse(String(init.body)) })
      : url === "/api/user/profile" ? ok(profile)
      : url.startsWith("/api/orders") ? ok({ orders })
      : ok({ addresses: [address] }));
  const store = configureStore({ reducer: { cartReducer }, preloadedState: { cartReducer: { items: [
    { id: 50, slug: "cumin-seeds", title: "Cumin Seeds", price: 149, discountedPrice: 149, quantity: 2, stockQuantity: 10, imgs: { thumbnails: [], previews: [] } },
  ] } } as never });
  render(<Provider store={store}><MyAccount path="/my-account" /></Provider>);
  await screen.findByText("Order ORD-1");
  return store;
}

describe("Account overview", () => {
  it("sends a signed-out visitor to sign-in with a return URL", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
    render(<MyAccount path="/my-account" />);
    expect(replace).toHaveBeenCalledWith("/auth/signin?callbackUrl=/my-account");
  });

  it("marks Overview as the current account page at /my-account and lists recent orders by stage", async () => {
    await openOverview();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    const pending = screen.getByText("Order ORD-1").closest("li")!;
    expect(within(pending).getByText("Payment submitted · verifying")).toBeInTheDocument();
    expect(within(pending).getByText("Not confirmed until we verify the payment")).toBeInTheDocument();
    expect(within(pending).getByRole("link", { name: "View order ORD-1" })).toHaveAttribute("href", "/orders#ORD-1");
    expect(within(screen.getByText("Order ORD-2").closest("li")!).queryByText(/Not confirmed/)).toBeNull();
    expect(screen.getByText(/12 Rajpur Road/)).toBeInTheDocument();
  });

  it("signs out without emptying the bag", async () => {
    const store = await openOverview();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    expect(store.getState().cartReducer.items).toHaveLength(1);
  });

  it("edits name and mobile in place and returns focus to Edit", async () => {
    await openOverview();
    const edit = screen.getByRole("button", { name: "Edit details" });
    fireEvent.click(edit);
    const name = screen.getByLabelText("Name");
    expect(document.activeElement).toBe(name);
    fireEvent.change(screen.getByLabelText("Mobile number (optional)"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    expect(screen.getByText("Please enter a valid 10-digit Indian mobile number")).toBeInTheDocument();

    fireEvent.change(name, { target: { value: "Asha Rawat" } });
    fireEvent.change(screen.getByLabelText("Mobile number (optional)"), { target: { value: "9876543210" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Save details" })); });
    expect(global.fetch).toHaveBeenCalledWith("/api/user/profile", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ name: "Asha Rawat", phone: "9876543210" }) }));
    expect(screen.getByText("Asha Rawat")).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit details" }));
  });
});
