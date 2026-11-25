import type { Metadata } from "next";
import Link from "next/link";
import PantryShell from "@/components/Pantry/PantryShell";
import { prisma } from "@/lib/prisma";
import { isValidOrderTrackingToken } from "@/lib/order-access";
import { UNPAID_ORDER_HOURS } from "@/lib/order-expiry";
import { rupees } from "@/components/Pantry/catalogue";
import p from "../../../../components/Pantry/pantry.module.css";
import r from "../../../../components/Pantry/review.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your order | Kosvana",
  description: "Follow a Kosvana order with the link from your order email.",
  robots: { index: false },
};

/** Plain words for each order status, and the badge style that goes with it. */
const STATUS: Record<string, { label: string; state: string }> = {
  PENDING: { label: "Awaiting payment", state: "awaiting" },
  PAYMENT_RECEIVED: { label: "Payment submitted · verifying", state: "verifying" },
  CONFIRMED: { label: "Confirmed", state: "done" },
  PROCESSING: { label: "Confirmed", state: "done" },
  SHIPPED: { label: "Shipped", state: "done" },
  DELIVERED: { label: "Delivered", state: "done" },
  COMPLETED: { label: "Delivered", state: "done" },
  CANCELLED: { label: "Cancelled", state: "cancelled" },
};

type Search = { order?: string | string[]; token?: string | string[] };
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** The order for a tracking link, or null. Callers must not tell "no such order" from "wrong token". */
async function trackedOrder(orderNumber: string, token: string) {
  if (!orderNumber || !token) return null;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true, orderNumber: true, status: true, total: true, subtotal: true, shipping: true, tax: true, couponDiscount: true, createdAt: true,
      orderItems: { select: { id: true, quantity: true, price: true, product: { select: { title: true } } } },
    },
  });
  return order && isValidOrderTrackingToken(order.id, token) ? order : null;
}

export default async function TrackPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const order = await trackedOrder(first(params.order).trim(), first(params.token).trim());
  const status = order ? STATUS[order.status] ?? { label: order.status, state: "done" } : null;

  return (
    <PantryShell browseHref="/shop">
      <main id="main" className={`${p.page} ${r.root}`}>
        <div className={p.pageHead}>
          <div>
            <p className={p.kicker}>Your order</p>
            <h1>Track your <em>order.</em></h1>
          </div>
        </div>
        {!order || !status ? (
          <section className={r.status} aria-labelledby="track-title">
            <h2 id="track-title">We can’t show this order.</h2>
            <p>This tracking link is incomplete or has expired. Open the link from your order email again, or contact us with your order number.</p>
            <div className={r.statusActions}>
              <Link href="/contact" className={p.primaryAction}>Contact us</Link>
              <Link href="/shop" className={p.textAction}>Shop the pantry</Link>
            </div>
          </section>
        ) : (
          <section className={r.status} aria-labelledby="track-title">
            <span className={r.badge} data-state={status.state}>{status.label}</span>
            <h2 id="track-title">Order <span className={r.num}>{order.orderNumber}</span></h2>
            {order.status === "PENDING" && <p>Pay within {UNPAID_ORDER_HOURS} hours. After that the order is cancelled.</p>}
            {order.status === "PAYMENT_RECEIVED" && <p>We received your payment details. The order is confirmed after we verify the payment.</p>}
            <dl className={r.facts}>
              <dt>Placed</dt>
              <dd>{order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}</dd>
              <dt>Status</dt><dd>{status.label}</dd>
            </dl>
            <ul className={r.trackLines}>
              {order.orderItems.map((item) => (
                <li key={item.id}>
                  <span>{item.product.title} <small>× {item.quantity}</small></span>
                  <span data-price>{rupees.format(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className={r.totals}>
              <dt>Subtotal</dt><dd data-price>{rupees.format(order.subtotal)}</dd>
              <dt>Delivery</dt><dd data-price>{order.shipping ? rupees.format(order.shipping) : "Free"}</dd>
              <dt>Convenience fee</dt><dd data-price>{rupees.format(order.tax)}</dd>
              {order.couponDiscount > 0 && <><dt>Coupon</dt><dd data-price>−{rupees.format(order.couponDiscount)}</dd></>}
              <dt className={r.grand}>Total</dt><dd className={r.grand} data-price>{rupees.format(order.total)}</dd>
            </dl>
            <div className={r.statusActions}>
              <Link href="/contact" className={p.textAction}>Questions about this order? Contact us</Link>
            </div>
          </section>
        )}
      </main>
    </PantryShell>
  );
}
