/** Order data as /api/orders returns it to the signed-in owner. */
export type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  couponDiscount?: number;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: { street?: string; city?: string; state?: string; zip?: string; country?: string } | null;
  orderItems: { id: string; quantity: number; price: number; product: { id?: number; title: string } }[];
  /** Latest UPI payment first. */
  upi_payments?: { status: string }[];
};

export type OrderStage = "pending" | "confirmed" | "cancelled";

/** "Payment pending verification": the order exists but nobody has verified its payment yet. */
export const PENDING_VERIFICATION = ["PENDING", "PAYMENT_RECEIVED"];
/** Statuses that come after payment verification. Invoices exist only for these. */
export const CONFIRMED_OR_LATER = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"];

export function orderStage(order: Pick<AccountOrder, "status">): OrderStage {
  if (order.status === "CANCELLED") return "cancelled";
  return PENDING_VERIFICATION.includes(order.status) ? "pending" : "confirmed";
}

const LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAYMENT_RECEIVED: "Payment submitted · verifying",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being prepared",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const latestPayment = (order: AccountOrder) => order.upi_payments?.[0]?.status;

export function statusLabel(order: AccountOrder) {
  if (orderStage(order) === "pending" && latestPayment(order) === "FAILED") return "Payment not verified";
  return LABELS[order.status] ?? order.status.charAt(0) + order.status.slice(1).toLowerCase().replace(/_/g, " ");
}

/** One line that tells the shopper what happens next for an unconfirmed order. */
export function pendingNote(order: AccountOrder) {
  if (orderStage(order) !== "pending") return null;
  if (latestPayment(order) === "FAILED") return "We could not verify this payment. Contact us and quote the order number.";
  if (order.status === "PAYMENT_RECEIVED" || latestPayment(order)) return "We have your UPI reference and are checking the payment.";
  return "No payment is recorded for this order yet.";
}

/** The owner can submit a UPI payment only while the order is PENDING and has no payment on record. */
export const canPay = (order: AccountOrder) => order.status === "PENDING" && !order.upi_payments?.length;

export const hasInvoice = (order: Pick<AccountOrder, "status">) => CONFIRMED_OR_LATER.includes(order.status);

/** "Cumin Seeds × 2, Black Pepper" with "and 2 more" after the second product. */
export function itemSummary(order: AccountOrder) {
  const names = order.orderItems.map(item => item.quantity > 1 ? `${item.product.title} × ${item.quantity}` : item.product.title);
  if (!names.length) return "Order items";
  return names.length > 2 ? `${names.slice(0, 2).join(", ")} and ${names.length - 2} more` : names.join(", ");
}

export const orderDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STEPS: { label: string; reachedAt: string[] }[] = [
  { label: "Order placed", reachedAt: ["PENDING", "PAYMENT_RECEIVED", ...CONFIRMED_OR_LATER] },
  { label: "Payment verified", reachedAt: CONFIRMED_OR_LATER },
  { label: "Being prepared", reachedAt: ["PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"] },
  { label: "Shipped", reachedAt: ["SHIPPED", "DELIVERED", "COMPLETED"] },
  { label: "Delivered", reachedAt: ["DELIVERED", "COMPLETED"] },
];

/** Progress for the Track view. The last reached step is the current one. */
export function orderSteps(order: Pick<AccountOrder, "status">) {
  const reached = STEPS.map(step => step.reachedAt.includes(order.status));
  const current = reached.lastIndexOf(true);
  return STEPS.map((step, index) => ({ label: step.label, done: reached[index], current: index === current }));
}
