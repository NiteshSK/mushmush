process.env.NEXTAUTH_SECRET = "test-secret";
import { render, screen } from "@testing-library/react";
import { prisma } from "@/lib/prisma";
import { createOrderPaymentToken, createOrderTrackingToken } from "@/lib/order-access";
import TrackPage from "../page";

jest.mock("@/lib/prisma", () => ({ prisma: { order: { findUnique: jest.fn() } } }));
jest.mock("@/components/Pantry/PantryShell", () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

const order = {
  id: "order-1", orderNumber: "ORD-1", status: "PAYMENT_RECEIVED", total: 241, subtotal: 149, shipping: 80, tax: 12, couponDiscount: 0,
  createdAt: new Date("2026-11-24T10:00:00Z"),
  orderItems: [{ id: "i1", quantity: 1, price: 149, product: { title: "Cumin Seeds" } }],
};
const findUnique = prisma.order.findUnique as jest.Mock;

async function open(params: Record<string, string>) {
  render(await TrackPage({ searchParams: Promise.resolve(params) }));
}

beforeEach(() => findUnique.mockReset().mockImplementation(async ({ where }: { where: { orderNumber: string } }) => (where.orderNumber === "ORD-1" ? order : null)));

describe("/track", () => {
  it("shows the order with a valid token", async () => {
    await open({ order: "ORD-1", token: createOrderTrackingToken("order-1") });
    expect(screen.getByRole("heading", { name: "Order ORD-1" })).toBeInTheDocument();
    expect(screen.getAllByText("Payment submitted · verifying").length).toBeGreaterThan(0);
    expect(screen.getByText("Cumin Seeds")).toBeInTheDocument();
    expect(screen.getByText("24 November 2026")).toBeInTheDocument();
    expect(document.body).toHaveTextContent("Total₹241");
  });

  it.each([
    ["a wrong token", { order: "ORD-1", token: "ab".repeat(32) }],
    ["a payment token", { order: "ORD-1", token: createOrderPaymentToken("order-1") }],
    ["a missing token", { order: "ORD-1" }],
    ["an unknown order", { order: "ORD-9", token: createOrderTrackingToken("order-9") }],
  ])("shows the same recovery message for %s", async (_label, params) => {
    await open(params as Record<string, string>);
    expect(screen.getByRole("heading", { name: "We can’t show this order." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
    expect(screen.queryByText("Cumin Seeds")).not.toBeInTheDocument();
  });

  it("does not query without a token", async () => {
    await open({ order: "ORD-1" });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("asks for payment within 48 hours while awaiting payment", async () => {
    findUnique.mockResolvedValue({ ...order, status: "PENDING" });
    await open({ order: "ORD-1", token: createOrderTrackingToken("order-1") });
    expect(screen.getByText("Pay within 48 hours. After that the order is cancelled.")).toBeInTheDocument();
  });
});
