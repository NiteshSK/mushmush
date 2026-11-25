"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import UPIPaymentModal from "@/components/Payment/UPIPaymentModal";
import AccountFrame, { useAccountSession } from "./AccountFrame";
import { type AccountOrder, canPay, hasInvoice, itemSummary, orderDate, orderStage, orderSteps, pendingNote, statusLabel } from "./orderStatus";
import { rupees } from "../Pantry/catalogue";
import styles from "../Pantry/pantry.module.css";
import a from "../Pantry/account.module.css";

const PAGE_SIZE = 20;

type Load = "loading" | "ready" | "error";

export default function Orders() {
  const { session, status } = useAccountSession("/orders");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [load, setLoad] = useState<Load>("loading");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [paying, setPaying] = useState<AccountOrder | null>(null);
  const [notice, setNotice] = useState("");

  const fetchPage = useCallback(async (next: number) => {
    const response = await fetch(`/api/orders?limit=${PAGE_SIZE}&page=${next}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Orders request failed: ${response.status}`);
    const data = await response.json();
    return { orders: (data.orders ?? []) as AccountOrder[], pages: data.pagination?.totalPages ?? 1 };
  }, []);

  const reload = useCallback(async () => {
    setLoad("loading");
    try {
      const result = await fetchPage(1);
      setOrders(result.orders);
      setPages(result.pages);
      setPage(1);
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, [fetchPage]);

  useEffect(() => { if (status === "authenticated") reload(); }, [status, reload]);

  async function showOlder() {
    try {
      const result = await fetchPage(page + 1);
      setOrders(previous => previous.concat(result.orders.filter(order => !previous.some(p => p.id === order.id))));
      setPage(page + 1);
      setPages(result.pages);
    } catch {
      setNotice("Older orders couldn’t load. Please try again.");
    }
  }

  const groups: { stage: ReturnType<typeof orderStage>; id: string; title: string; note?: string }[] = [
    { stage: "pending", id: "pending-orders", title: "Payment pending verification",
      note: "We check each UPI payment before we prepare an order. These orders are not confirmed yet. Invoices are ready after the payment is verified." },
    { stage: "confirmed", id: "confirmed-orders", title: "Confirmed orders" },
    { stage: "cancelled", id: "cancelled-orders", title: "Cancelled orders" },
  ];

  return <AccountFrame path="/orders" title={<>Your <em>orders.</em></>}>
    {notice && <p className={a.notice} role="status">{notice}</p>}
    {load === "loading" && !orders.length ? <div aria-busy="true" aria-label="Loading orders">
      {Array.from({ length: 3 }, (_, i) => <div key={i} className={a.skeletonRow} />)}
    </div> : load === "error" ? <div className={styles.recovery} role="alert">
      <h2>Your orders couldn’t load.</h2>
      <p>Check your connection and try again.</p>
      <button className={styles.primaryAction} onClick={reload}>Try again</button>
    </div> : !orders.length ? <div className={styles.recovery}>
      <h2>No orders yet.</h2>
      <p>When you place an order, you can follow its payment, preparation and delivery here.</p>
      <Link href="/shop" className={styles.primaryAction}>Shop the pantry</Link>
    </div> : <>
      {groups.map(group => {
        const items = orders.filter(order => orderStage(order) === group.stage);
        if (!items.length) return null;
        return <section key={group.stage} className={a.section} aria-labelledby={group.id}>
          <div className={a.sectionHead}>
            <h2 id={group.id}>{group.title}</h2>
            <p>{items.length} {items.length === 1 ? "order" : "orders"}</p>
          </div>
          {group.note && <p className={a.sectionNote}>{group.note}</p>}
          <ul className={a.list}>
            {items.map(order => <OrderRow key={order.id} order={order} onPay={() => setPaying(order)} />)}
          </ul>
        </section>;
      })}
      {page < pages && <p className={a.section}><button className={styles.textAction} onClick={showOlder}>Show older orders</button></p>}
    </>}
    {/* The shared UPI dialog opens itself, closes on Escape and returns focus to "Pay by UPI". */}
    {paying && <UPIPaymentModal payment={{ type: "order", orderNumber: paying.orderNumber, customerName: paying.customerName || session?.user?.name || "",
      email: paying.customerEmail || session?.user?.email || "", amount: paying.total }}
      onClose={() => setPaying(null)} onPaymentComplete={() => { setNotice(`Thank you. We have your payment details for order ${paying.orderNumber} and will verify them.`); reload(); }} />}
  </AccountFrame>;
}

type InvoiceState = { busy?: boolean; message?: string; href?: string };

export function OrderRow({ order, onPay }: { order: AccountOrder; onPay: () => void }) {
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceState>({});
  const stage = orderStage(order);
  const note = pendingNote(order);
  const detailsId = `order-details-${order.id}`;
  const failed = note?.startsWith("We could not");

  async function openInvoice() {
    setInvoice({ busy: true });
    try {
      const response = await fetch(`/api/orders/${order.id}/invoice`);
      if (!response.ok) {
        setInvoice({ message: response.status === 403 ? "The invoice is ready after we verify the payment."
          : response.status === 404 ? "The invoice is not ready yet. Please try again later."
          : "We couldn’t open the invoice. Please try again." });
        return;
      }
      const data = await response.json();
      if (!data.pdfPath) { setInvoice({ message: "The invoice is not ready yet. Please try again later." }); return; }
      const tab = window.open(data.pdfPath, "_blank");
      if (tab) tab.opener = null;
      // A blocked pop-up still leaves the shopper a link next to the order.
      setInvoice(tab ? {} : { message: "Your invoice is ready.", href: data.pdfPath });
    } catch {
      setInvoice({ message: "We couldn’t open the invoice. Please try again." });
    }
  }

  return <li id={order.orderNumber}>
    <div className={a.row}>
      <div className={a.rowMain}>
        <p className={a.meta}><span>Order {order.orderNumber}</span><span>Placed {orderDate(order.createdAt)}</span></p>
        <p className={a.rowTitle}>{itemSummary(order)}</p>
        <p className={a.statusLine}>
          <span className={a.status} data-tone={stage}>{statusLabel(order)}</span>
          {note && <span>{note}{failed && <> <Link href="/contact" className={a.textButton}>Contact us</Link></>}</span>}
        </p>
      </div>
      <div className={a.side}>
        <p className={a.amount}><span className={styles.srOnly}>Total </span>{rupees.format(order.total)}</p>
        <div className={a.actions}>
          {canPay(order) && <button className={a.pay} onClick={onPay} aria-label={`Pay for order ${order.orderNumber} by UPI`}>Pay by UPI</button>}
          <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={detailsId}>
            {stage === "confirmed" ? "Track order" : "Order details"}<span className={styles.srOnly}> {order.orderNumber}</span>
          </button>
          {hasInvoice(order) && <button onClick={openInvoice} disabled={invoice.busy}>
            {invoice.busy ? "Opening invoice…" : "Invoice"}<span className={styles.srOnly}> for order {order.orderNumber}</span>
          </button>}
        </div>
        <p className={a.inlineNote} role="status">
          {invoice.message}{invoice.href && <> <a href={invoice.href} target="_blank" rel="noopener noreferrer">Open the invoice</a></>}
        </p>
      </div>
    </div>
    {open && <OrderDetails id={detailsId} order={order} />}
  </li>;
}

function OrderDetails({ id, order }: { id: string; order: AccountOrder }) {
  const address = order.shippingAddress;
  const shipping = order.shipping ?? 0;
  return <div id={id} className={a.details}>
    <div>
      <h3>Progress</h3>
      {order.status === "CANCELLED" ? <p className={a.quiet}>This order was cancelled.</p> : <ol className={a.steps}>
        {orderSteps(order).map(step => <li key={step.label} data-done={step.done || undefined} aria-current={step.current ? "step" : undefined}>
          {step.label}{step.done && !step.current && <span className={styles.srOnly}> (done)</span>}
        </li>)}
      </ol>}
    </div>
    <div>
      <h3>Items</h3>
      <ul className={a.lines}>
        {order.orderItems.map(item => <li key={item.id}>
          <span>{item.product.title} × {item.quantity}</span><span>{rupees.format(item.price * item.quantity)}</span>
        </li>)}
      </ul>
      <dl className={a.totals}>
        {order.subtotal != null && <div><dt>Subtotal</dt><dd>{rupees.format(order.subtotal)}</dd></div>}
        {order.subtotal != null && <div><dt>Delivery</dt><dd>{shipping ? rupees.format(shipping) : "Free"}</dd></div>}
        {!!order.couponDiscount && <div><dt>Coupon</dt><dd>−{rupees.format(order.couponDiscount)}</dd></div>}
        {!!order.tax && <div><dt>Tax</dt><dd>{rupees.format(order.tax)}</dd></div>}
        <div><dt>Total</dt><dd>{rupees.format(order.total)}</dd></div>
      </dl>
    </div>
    {address && <div>
      <h3>Delivering to</h3>
      <address className={a.address}>
        {address.street}<br />{[address.city, address.state].filter(Boolean).join(", ")} {address.zip}<br />{address.country}
      </address>
    </div>}
  </div>;
}
