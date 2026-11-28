import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { rupees } from "../../Pantry/catalogue";
import CheckoutWithOTP from "../CheckoutWithOTP";

jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

const product = (id: number, slug: string, title: string, category: string, price: number) => ({
  id, slug, title, description: "", price, discountedPrice: null, measurementValue: 200, measurementType: "gm", stockQuantity: 50,
  inStock: true, imgs: { previews: [], thumbnails: [] }, categories: [{ category: { id: 1, slug: category, title: category } }],
});
const cumin = product(50, "cumin-seeds", "Cumin Seeds", "spices", 149);
const oyster = product(14, "king-oyster-eryngii", "King Oyster (Eryngii)", "edible", 259);
const line = (p: typeof cumin, quantity: number) => ({ id: p.id, slug: p.slug, title: p.title, price: p.price, quantity, stockQuantity: 50, imgs: p.imgs });

const pricing = {
  items: [{ productId: 50, title: "Cumin Seeds", quantity: 1, listPrice: 159, unitPrice: 159, lineTotal: 159 }],
  subtotal: 159, shippingFee: 80, convenienceFee: CONVENIENCE_FEE, couponDiscount: 0, total: 159 + 80 + CONVENIENCE_FEE,
};
const token = "ab".repeat(32);
type Call = { url: string; body: unknown };
let calls: Call[];
let verifyCount: number;
let refuseFresh = false;
let refuseStock = false;

function mockServer() {
  calls = [];
  verifyCount = 0;
  (global.fetch as jest.Mock).mockImplementation(async (url: string, init?: RequestInit) => {
    const body = init?.body instanceof FormData ? init.body : init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, body });
    const json = (status: number, data: unknown) => ({ ok: status < 300, status, json: async () => data });
    if (url.startsWith("/api/shipping/check")) {
      const pin = new URLSearchParams(url.split("?")[1]).get("pincode");
      return json(200, { deliverable: true, pincode: pin, zoneName: pin?.startsWith("248") ? "Local Dehradun" : "Delhi NCR", shippingFee: 80, estimatedDays: "2-4 days", freeAbove: 1999 });
    }
    if (url === "/api/addresses") return json(200, { addresses: [
      { id: "a1", street: "4 Rajpur Road", city: "Dehradun", state: "Uttarakhand", zip: "248001", country: "India", type: "SHIPPING", isDefault: false },
      { id: "a2", street: "12 Janpath", city: "New Delhi", state: "Delhi", zip: "110001", country: "India", type: "SHIPPING", isDefault: true },
    ] });
    if (url.startsWith("/api/user/profile")) return json(200, { phone: "9876543210" });
    if (url === "/api/checkout/send-otp") return json(200, { success: true, channels: { email: true } });
    if (url === "/api/checkout/verify-and-place-order") {
      verifyCount++;
      if (refuseFresh) return json(400, { code: "UNDELIVERABLE", error: "Fresh mushrooms deliver only to approved Dehradun PINs. Remove fresh items to ship your pantry goods across India." });
      if (refuseStock) return json(409, { code: "STOCK", stockErrors: ["Cumin Seeds only has 1 pack left."] });
      return verifyCount === 1
        ? json(409, { code: "TOTAL_MISMATCH", error: "Prices changed", pricing })
        : json(200, { success: true, order: { id: "o1", orderNumber: "KOS-1", total: pricing.total, status: "PENDING" }, paymentToken: token, trackingUrl: "/track?order=KOS-1&token=t", pricing });
    }
    if (url === "/api/checkout/upi-payment") return json(200, { success: true, payment: { transactionId: "412345678901" } });
    return json(404, {});
  });
}

function renderCheckout(items: ReturnType<typeof line>[]) {
  (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
  (useProducts as jest.Mock).mockReturnValue({ products: [cumin, oyster], loading: false, error: null });
  const store = configureStore({ reducer: { cartReducer }, preloadedState: { cartReducer: { items } } });
  render(<Provider store={store}><CheckoutWithOTP /></Provider>);
  return store;
}

async function enterPin(pin: string) {
  fireEvent.change(screen.getByLabelText("Delivery PIN code"), { target: { value: pin } });
  await screen.findByText(new RegExp(`Delivers to ${pin}`));
}

function fillDetails(pin: string) {
  const type = (label: string | RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
  type("First name", "Asha");
  type("Last name", "Rawat");
  type("Email", "asha@example.test");
  type("Mobile number", "9876543210");
  type("House number and street", "12 Janpath");
  type("City or town", "New Delhi");
  type("State", "Delhi");
  type(/^PIN code$/, pin);
  fireEvent.click(screen.getByRole("button", { name: "Use this address" }));
}

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
  sessionStorage.clear();
  refuseFresh = false;
  refuseStock = false;
  mockServer();
});

describe("checkout", () => {
  it("shows every fee before payment for the delivery PIN", async () => {
    renderCheckout([line(cumin, 1)]);
    expect(screen.getByTestId("checkout-total")).toHaveTextContent(rupees.format(149 + CONVENIENCE_FEE));
    expect(screen.getByText("Total before delivery")).toBeInTheDocument();
    await enterPin("110001");
    expect(screen.getByTestId("delivery-fee")).toHaveTextContent("₹80");
    expect(screen.getByRole("complementary", { name: "Your order" })).toHaveTextContent(`Convenience fee${rupees.format(CONVENIENCE_FEE)}`);
    expect(screen.getByTestId("checkout-total")).toHaveTextContent(rupees.format(149 + 80 + CONVENIENCE_FEE));
    expect(document.body).not.toHaveTextContent(/taxes included/i);
  });

  it("recovers from a price change with the same code, then pays with the payment token", async () => {
    renderCheckout([line(cumin, 1)]);
    await enterPin("110001");
    fillDetails("110001");
    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));

    const otpDialog = await screen.findByRole("dialog", { name: "Verify your email" });
    fireEvent.change(within(otpDialog).getByLabelText("6-digit code"), { target: { value: "123456" } });
    fireEvent.click(within(otpDialog).getByRole("button", { name: "Verify and place order" }));

    const again = await within(otpDialog).findByRole("button", { name: `Place order for ${rupees.format(pricing.total)}` });
    expect(otpDialog).toHaveTextContent("Cumin Seeds: ₹149 → ₹159 each");
    expect(screen.getByTestId("checkout-total")).toHaveTextContent(rupees.format(pricing.total));
    fireEvent.click(again);

    const upi = await screen.findByRole("dialog", { name: `Pay ${rupees.format(pricing.total)} by UPI` });
    const verifies = calls.filter((call) => call.url === "/api/checkout/verify-and-place-order").map((call) => call.body as { otp: string; total: number });
    expect(verifies.map(({ otp, total }) => ({ otp, total }))).toEqual([{ otp: "123456", total: 149 + 80 + CONVENIENCE_FEE }, { otp: "123456", total: pricing.total }]);
    expect(upi).toHaveTextContent("Order KOS-1 is waiting for payment");

    fireEvent.change(within(upi).getByLabelText("UPI transaction ID"), { target: { value: "412345678901" } });
    fireEvent.click(within(upi).getByRole("button", { name: "Submit payment details" }));
    await screen.findByText("Payment submitted · verifying");
    const form = calls.find((call) => call.url === "/api/checkout/upi-payment")!.body as FormData;
    expect(form.get("paymentToken")).toBe(token);
    expect(form.get("orderNumber")).toBe("KOS-1");
    expect(form.get("amount")).toBe(String(pricing.total));
    expect(screen.getByText("Pending verification")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Track this order" })).toHaveAttribute("href", "/track?order=KOS-1&token=t");
    expect(screen.queryByText(/payment confirmed/i)).not.toBeInTheDocument();
  });

  it("sends the shopper back to the bag if stock changes while the code dialog is open", async () => {
    refuseStock = true;
    renderCheckout([line(cumin, 2)]);
    await enterPin("110001");
    fillDetails("110001");
    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));
    const otpDialog = await screen.findByRole("dialog", { name: "Verify your email" });
    fireEvent.change(within(otpDialog).getByLabelText("6-digit code"), { target: { value: "123456" } });
    fireEvent.click(within(otpDialog).getByRole("button", { name: "Verify and place order" }));

    const message = await screen.findByText("Cumin Seeds only has 1 pack left.");
    expect(within(message).getByRole("link", { name: "Review bag" })).toHaveAttribute("href", "/cart");
    expect(screen.getByRole("button", { name: "Send verification code" })).toBeDisabled();
    expect(otpDialog).not.toBeInTheDocument();
  });

  it("keeps the order awaiting payment when the shopper closes the UPI dialog", async () => {
    renderCheckout([line(cumin, 1)]);
    await enterPin("110001");
    fillDetails("110001");
    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));
    const otpDialog = await screen.findByRole("dialog", { name: "Verify your email" });
    fireEvent.change(within(otpDialog).getByLabelText("6-digit code"), { target: { value: "123456" } });
    fireEvent.click(within(otpDialog).getByRole("button", { name: "Verify and place order" }));
    fireEvent.click(await within(otpDialog).findByRole("button", { name: /Place order for/ }));
    const upi = await screen.findByRole("dialog", { name: /by UPI$/ });
    fireEvent.click(within(upi).getByRole("button", { name: "Pay later" }));
    expect(screen.getByText("Awaiting payment")).toBeInTheDocument();
    expect(screen.getByText("Pay within 48 hours. After that the order is cancelled.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Track this order" })).toHaveAttribute("href", "/track?order=KOS-1&token=t");
    fireEvent.click(screen.getByRole("button", { name: `Pay ${rupees.format(pricing.total)} by UPI` }));
    expect(screen.getByRole("dialog", { name: /by UPI$/ })).toBeInTheDocument();
  });

  it("names the fresh line a PIN outside Dehradun cannot take and holds the code", async () => {
    const store = renderCheckout([line(oyster, 1), line(cumin, 2)]);
    await enterPin("110001");
    const conflict = screen.getByTestId("fresh-conflict");
    expect(conflict).toHaveTextContent("King Oyster (Eryngii) is a fresh mushroom, delivered only in Dehradun. We can’t deliver it to 110001.");
    expect(conflict).not.toHaveTextContent("Cumin");

    fillDetails("110001");
    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));
    expect(screen.getByText("Remove King Oyster (Eryngii) or change the delivery address to continue.")).toBeInTheDocument();
    expect(calls.some((call) => call.url === "/api/checkout/send-otp")).toBe(false);

    fireEvent.click(within(conflict).getByRole("button", { name: "Remove King Oyster (Eryngii)" }));
    expect(store.getState().cartReducer.items).toEqual([expect.objectContaining({ slug: "cumin-seeds", quantity: 2 })]);
    await waitFor(() => expect(screen.queryByTestId("fresh-conflict")).not.toBeInTheDocument());
  });

  it("shows the server's UNDELIVERABLE reason beside the fresh line and lets the shopper remove just that line", async () => {
    refuseFresh = true;
    const store = renderCheckout([line(oyster, 1), line(cumin, 2)]);
    await enterPin("248001");
    expect(screen.queryByTestId("fresh-conflict")).not.toBeInTheDocument();
    fillDetails("248001");
    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));
    const otpDialog = await screen.findByRole("dialog", { name: "Verify your email" });
    fireEvent.change(within(otpDialog).getByLabelText("6-digit code"), { target: { value: "123456" } });
    fireEvent.click(within(otpDialog).getByRole("button", { name: "Verify and place order" }));

    const refusal = await screen.findByTestId("server-undeliverable");
    expect(screen.queryByRole("dialog", { name: "Verify your email" })).not.toBeInTheDocument();
    expect(refusal).toHaveTextContent("We couldn’t place the order. Fresh mushrooms deliver only to approved Dehradun PINs.");
    expect(refusal).toHaveTextContent("King Oyster (Eryngii) is a fresh mushroom");
    expect(refusal).not.toHaveTextContent("Cumin");
    // The refusal sits right after the order lines, next to the affected line.
    expect(screen.getByRole("complementary", { name: "Your order" }).querySelector("ul + [data-testid=server-undeliverable]")).toBe(refusal);

    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));
    expect(screen.getByText("Remove King Oyster (Eryngii) or change the delivery address to continue.")).toBeInTheDocument();
    expect(calls.filter((call) => call.url === "/api/checkout/send-otp")).toHaveLength(1);

    fireEvent.click(within(refusal).getByRole("button", { name: "Remove King Oyster (Eryngii)" }));
    expect(store.getState().cartReducer.items).toEqual([expect.objectContaining({ slug: "cumin-seeds", quantity: 2 })]);
    await waitFor(() => expect(screen.queryByTestId("server-undeliverable")).not.toBeInTheDocument());
  });

  it("selects the signed-in shopper's default saved address and checks delivery for its PIN", async () => {
    (useProducts as jest.Mock).mockReturnValue({ products: [cumin, oyster], loading: false, error: null });
    (useSession as jest.Mock).mockReturnValue({ data: { user: { id: "u1", email: "asha@example.test", name: "Asha Rawat" } }, status: "authenticated" });
    const store = configureStore({ reducer: { cartReducer }, preloadedState: { cartReducer: { items: [line(cumin, 1)] } } });
    render(<Provider store={store}><CheckoutWithOTP /></Provider>);
    const saved = await screen.findByRole("radio", { name: /12 Janpath/ });
    await waitFor(() => expect(saved).toBeChecked());
    expect(screen.getByRole("radio", { name: /4 Rajpur Road/ })).not.toBeChecked();
    // The new-address form stays closed once saved addresses arrive.
    expect(screen.queryByLabelText("House number and street")).not.toBeInTheDocument();
    expect(await screen.findByText(/Delivers to 110001/)).toBeInTheDocument();
    expect(screen.getByLabelText("Delivery PIN code")).toHaveValue("110001");

    fireEvent.click(screen.getByRole("radio", { name: /4 Rajpur Road/ }));
    expect(await screen.findByText(/Delivers to 248001/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("confirms fresh delivery to 248001", async () => {
    renderCheckout([line(oyster, 1)]);
    await enterPin("248001");
    expect(screen.queryByTestId("fresh-conflict")).not.toBeInTheDocument();
  });

  it("gives an empty bag a way back to the shop", () => {
    renderCheckout([]);
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });
});
