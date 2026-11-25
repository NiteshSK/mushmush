import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useSession } from "next-auth/react";
import Orders from "./Orders";
import { canPay, hasInvoice, itemSummary, orderStage, orderSteps, statusLabel } from "./orderStatus";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: jest.fn() }), usePathname: () => "/orders" }));
// The shared jest setup drops every Link prop except href; keep aria attributes for these tests.
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));
jest.mock("@/components/Payment/UPIPaymentModal", () => ({
  __esModule: true,
  default: ({ payment, onClose }: { payment: { orderNumber: string; amount: number }; onClose: () => void }) =>
    <div>UPI form for {payment.orderNumber}, ₹{payment.amount}<button onClick={onClose}>Cancel payment</button></div>,
}));

const order = (n: number, status: string, extra = {}) => ({
  id: `o${n}`, orderNumber: `ORD-${n}`, status, total: 557, subtotal: 497, shipping: 60, tax: 0, couponDiscount: 0,
  createdAt: "2026-11-20T10:00:00.000Z",
  shippingAddress: { street: "12 Rajpur Road", city: "Dehradun", state: "Uttarakhand", zip: "248001", country: "India" },
  orderItems: [{ id: `i${n}`, quantity: 2, price: 149, product: { title: "Cumin Seeds" } }, { id: `j${n}`, quantity: 1, price: 199, product: { title: "Black Pepper" } }],
  upi_payments: [] as { status: string }[], ...extra,
});

const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: async () => body });
const fail = (status: number) => Promise.resolve({ ok: false, status, json: async () => ({ error: "nope" }) });

function signIn(status: "authenticated" | "unauthenticated" = "authenticated") {
  (useSession as jest.Mock).mockReturnValue(status === "authenticated"
    ? { data: { user: { id: "u1", name: "Test Shopper", email: "shopper@example.test" } }, status } : { data: null, status });
}

async function openOrders(orders: ReturnType<typeof order>[], invoice: () => Promise<unknown> = () => fail(403)) {
  signIn();
  (global.fetch as jest.Mock).mockImplementation((url: string) =>
    url.startsWith("/api/orders?") ? ok({ orders, pagination: { totalPages: 1 } }) : url.endsWith("/invoice") ? invoice() : fail(404));
  render(<Orders />);
  await screen.findAllByRole("heading", { level: 2, name: /orders|verification/ });
}

describe("order status rules", () => {
  it("treats PENDING and PAYMENT_RECEIVED as unverified and later statuses as confirmed", () => {
    expect(["PENDING", "PAYMENT_RECEIVED"].map(status => orderStage({ status }))).toEqual(["pending", "pending"]);
    expect(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"].map(status => orderStage({ status }))).toEqual(Array(5).fill("confirmed"));
    expect(orderStage({ status: "CANCELLED" })).toBe("cancelled");
  });

  it("offers payment only for an unpaid pending order and invoices only after verification", () => {
    expect(canPay(order(1, "PENDING"))).toBe(true);
    expect(canPay(order(1, "PENDING", { upi_payments: [{ status: "FAILED" }] }))).toBe(false);
    expect(canPay(order(1, "PAYMENT_RECEIVED"))).toBe(false);
    expect(hasInvoice({ status: "PAYMENT_RECEIVED" })).toBe(false);
    expect(hasInvoice({ status: "SHIPPED" })).toBe(true);
    expect(statusLabel(order(1, "PENDING", { upi_payments: [{ status: "FAILED" }] }))).toBe("Payment not verified");
    expect(statusLabel(order(1, "PENDING"))).toBe("Awaiting payment");
    expect(statusLabel(order(1, "PAYMENT_RECEIVED", { upi_payments: [{ status: "PENDING" }] }))).toBe("Payment submitted · verifying");
    expect(statusLabel(order(1, "SHIPPED"))).toBe("Shipped");
  });

  it("summarises items and marks the last reached step as current", () => {
    expect(itemSummary(order(1, "PENDING"))).toBe("Cumin Seeds × 2, Black Pepper");
    expect(orderSteps({ status: "SHIPPED" }).map(step => [step.label, step.done, step.current])).toEqual([
      ["Order placed", true, false], ["Payment verified", true, false], ["Being prepared", true, false], ["Shipped", true, true], ["Delivered", false, false],
    ]);
  });
});

describe("Orders page", () => {
  it("sends a signed-out visitor to sign-in with a return URL", () => {
    signIn("unauthenticated");
    render(<Orders />);
    expect(replace).toHaveBeenCalledWith("/auth/signin?callbackUrl=/orders");
  });

  it("separates payment pending verification from confirmed and cancelled orders", async () => {
    await openOrders([order(1, "PENDING"), order(2, "PAYMENT_RECEIVED", { upi_payments: [{ status: "PENDING" }] }), order(3, "SHIPPED"), order(4, "CANCELLED")]);
    const pending = screen.getByRole("region", { name: "Payment pending verification" });
    const confirmed = screen.getByRole("region", { name: "Confirmed orders" });
    const cancelled = screen.getByRole("region", { name: "Cancelled orders" });
    expect(within(pending).getByText("Order ORD-1")).toBeInTheDocument();
    expect(within(pending).getByText("Order ORD-2")).toBeInTheDocument();
    expect(within(pending).getByText("Payment submitted · verifying")).toBeInTheDocument();
    expect(within(confirmed).getByText("Order ORD-3")).toBeInTheDocument();
    expect(within(confirmed).queryByText("Order ORD-1")).toBeNull();
    expect(within(cancelled).getByText("Order ORD-4")).toBeInTheDocument();
    // Actions sit on the order they act on.
    const unpaid = screen.getByText("Order ORD-1").closest("li")!;
    expect(within(unpaid).getByRole("button", { name: "Pay for order ORD-1 by UPI" })).toBeInTheDocument();
    expect(within(unpaid).queryByRole("button", { name: /Invoice/ })).toBeNull();
    expect(within(screen.getByText("Order ORD-2").closest("li")!).queryByRole("button", { name: /Pay/ })).toBeNull();
    expect(within(screen.getByText("Order ORD-3").closest("li")!).getByRole("button", { name: "Invoice for order ORD-3" })).toBeInTheDocument();
  });

  it("tracks a confirmed order in place", async () => {
    await openOrders([order(3, "SHIPPED")]);
    const track = screen.getByRole("button", { name: "Track order ORD-3" });
    expect(track).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(track);
    expect(track).toHaveAttribute("aria-expanded", "true");
    const details = document.getElementById(track.getAttribute("aria-controls")!)!;
    expect(within(details).getByText("Shipped").closest("li")).toHaveAttribute("aria-current", "step");
    expect(within(details).getByText("Cumin Seeds × 2")).toBeInTheDocument();
    expect(within(details).getByText(/12 Rajpur Road/)).toBeInTheDocument();
  });

  it("explains an unavailable invoice next to the order instead of an alert", async () => {
    await openOrders([order(3, "CONFIRMED")]);
    fireEvent.click(screen.getByRole("button", { name: "Invoice for order ORD-3" }));
    expect(await screen.findByText("The invoice is ready after we verify the payment.")).toBeInTheDocument();
  });

  it("opens a ready invoice in a new tab", async () => {
    const tab = { opener: {} };
    const open = jest.spyOn(window, "open").mockReturnValue(tab as unknown as Window);
    await openOrders([order(3, "DELIVERED")], () => ok({ pdfPath: "https://example.test/invoice.pdf" }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Invoice for order ORD-3" })); });
    expect(open).toHaveBeenCalledWith("https://example.test/invoice.pdf", "_blank");
    expect(tab.opener).toBeNull();
    open.mockRestore();
  });

  it("opens the shared UPI form for an unpaid order with its amount, and closes it", async () => {
    await openOrders([order(1, "PENDING")]);
    fireEvent.click(screen.getByRole("button", { name: "Pay for order ORD-1 by UPI" }));
    expect(screen.getByText("UPI form for ORD-1, ₹557")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel payment" }));
    expect(screen.queryByText(/UPI form/)).toBeNull();
  });

  it("offers a way back to the shop when there are no orders", async () => {
    await openOrders([]);
    expect(screen.getByRole("heading", { name: "No orders yet." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });

  it("shows a retry when orders fail to load", async () => {
    signIn();
    (global.fetch as jest.Mock).mockImplementation(() => fail(500));
    render(<Orders />);
    expect(await screen.findByRole("heading", { name: "Your orders couldn’t load." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
