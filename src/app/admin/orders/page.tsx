"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";
import {
  WorkflowStepper,
  ConfirmStatusModal,
  StatusIcon,
  type StatusMeta,
} from "@/components/Admin/WorkflowStepper";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  couponDiscount: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: { id: number; title: string; imgs: any };
  }[];
  user: { id: string; name: string | null; email: string } | null;
  upi_payments?: {
    id: string;
    status: string;
    amount: number;
    transactionId: string | null;
    createdAt: string;
  }[];
}

const PIPELINE = [
  "PENDING",
  "PAYMENT_RECEIVED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
] as const;

const STATUS_META: Record<string, StatusMeta & { color: string }> = {
  PENDING:          { label: "Pending",          icon: "clock",   bgLight: "bg-gray-2 text-dark-5",          color: "text-dark-5" },
  PAYMENT_RECEIVED: { label: "Payment Received", icon: "dollar",  bgLight: "bg-blue/10 text-blue",           color: "text-blue" },
  CONFIRMED:        { label: "Confirmed",        icon: "check",   bgLight: "bg-forest/10 text-forest",       color: "text-forest" },
  PROCESSING:       { label: "Processing",       icon: "package", bgLight: "bg-[#FEF3C7] text-[#D97706]",    color: "text-[#D97706]" },
  SHIPPED:          { label: "Shipped",          icon: "truck",   bgLight: "bg-blue/10 text-blue",           color: "text-blue" },
  DELIVERED:        { label: "Delivered",        icon: "home",    bgLight: "bg-forest/10 text-forest",       color: "text-forest" },
  COMPLETED:        { label: "Completed",        icon: "star",    bgLight: "bg-forest/10 text-forest",       color: "text-forest" },
  CANCELLED:        { label: "Cancelled",        icon: "x",       bgLight: "bg-red/10 text-red",             color: "text-red" },
};

const ORDER_WARNINGS: Record<string, string> = {
  PAYMENT_RECEIVED: "This marks that payment has been submitted by the customer. Stock will be reserved.",
  CONFIRMED: "This confirms you have verified the payment. The customer will be notified.",
  PROCESSING: "This will notify the customer that their order is being packed.",
  SHIPPED: "This will notify the customer that their order is on its way.",
  DELIVERED: "This will notify the customer that their order has been delivered.",
  COMPLETED: "This will generate the invoice and email it to the customer.",
  CANCELLED: "This will cancel the order and restore stock if it was decremented.",
};

// ─── Order Row ───────────────────────────────────────────────────────────
const OrderRow = ({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationChecked, setVerificationChecked] = useState(false);

  // Is this a payment verification step?
  const isPaymentVerification = confirmTarget === "CONFIRMED" && order.status === "PAYMENT_RECEIVED";

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    if (isPaymentVerification && !verificationChecked) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirmTarget, verificationNotes: isPaymentVerification ? verificationNotes : undefined }),
      });
      if (response.ok) {
        toast.success(`Order moved to ${STATUS_META[confirmTarget]?.label}`);
        onStatusChange();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update order status");
      }
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
      setConfirmTarget(null);
      setVerificationNotes("");
      setVerificationChecked(false);
    }
  };

  const meta = STATUS_META[order.status] || STATUS_META.PENDING;

  return (
    <>
      <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-gray-1/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-medium text-dark text-sm">#{order.orderNumber}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${meta.bgLight}`}>
                <StatusIcon name={meta.icon} size={10} />
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-dark-5 flex items-center gap-1.5 flex-wrap">
              <span>{order.customerName}</span>
              <span>&middot;</span>
              <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              {(() => {
                const p = order.upi_payments?.[0];
                if (!p) return <span className="inline-flex items-center gap-0.5 text-[#D97706]"><StatusIcon name="clock" size={10} />No payment</span>;
                if (p.status === "VERIFIED") return <span className="inline-flex items-center gap-0.5 text-forest"><StatusIcon name="check" size={10} />Paid</span>;
                if (p.status === "FAILED") return <span className="inline-flex items-center gap-0.5 text-red"><StatusIcon name="x" size={10} />Failed</span>;
                return <span className="inline-flex items-center gap-0.5 text-blue"><StatusIcon name="clock" size={10} />Verifying</span>;
              })()}
            </p>
          </div>
          <div className="hidden sm:block text-right mr-2">
            <p className="text-sm font-medium text-dark">
              ₹{order.total.toFixed(2)}
            </p>
            <p className="text-xs text-dark-5">
              {order.orderItems.length} item
              {order.orderItems.length !== 1 ? "s" : ""}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-dark-5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {expanded && (
          <div className="border-t border-gray-3 px-4 sm:px-6 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-2">Customer</h4>
                  <p className="text-sm text-dark font-medium">{order.customerName}</p>
                  <p className="text-sm text-dark-5">{order.customerEmail}</p>
                  {order.customerPhone && <p className="text-sm text-dark-5">{order.customerPhone}</p>}
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-1 overflow-hidden flex-shrink-0">
                          {item.product.imgs?.thumbnails?.[0] && (
                            <img src={item.product.imgs.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-dark truncate">{item.product.title}</p>
                          <p className="text-xs text-dark-5">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-medium text-dark">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-1 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-dark-5">Subtotal</span><span className="text-dark">₹{order.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-dark-5">Shipping</span><span className="text-dark">{order.shipping === 0 ? "FREE" : `₹${order.shipping.toFixed(2)}`}</span></div>
                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between"><span className="text-forest">Coupon</span><span className="text-forest">-₹{order.couponDiscount.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between border-t border-gray-3 pt-1 font-medium"><span className="text-dark">Total</span><span className="text-dark">₹{order.total.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="space-y-5">
                {/* Payment Status */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-2">Payment Status</h4>
                  {(() => {
                    const payment = order.upi_payments?.[0];
                    if (!payment) {
                      return (
                        <div className="flex items-center gap-2 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-lg px-3 py-2.5">
                          <StatusIcon name="clock" size={14} />
                          <div>
                            <p className="text-xs font-medium text-[#D97706]">Awaiting Payment</p>
                            <p className="text-[10px] text-[#D97706]/70">Customer has not submitted payment yet</p>
                          </div>
                        </div>
                      );
                    }
                    if (payment.status === "VERIFIED") {
                      return (
                        <div className="flex items-center gap-2 bg-forest/5 border border-forest/15 rounded-lg px-3 py-2.5">
                          <StatusIcon name="check" size={14} />
                          <div>
                            <p className="text-xs font-medium text-forest">Payment Verified</p>
                            <p className="text-[10px] text-dark-5">
                              ₹{payment.amount.toFixed(2)}
                              {payment.transactionId && <> &middot; TXN: <span className="font-mono">{payment.transactionId}</span></>}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    if (payment.status === "FAILED") {
                      return (
                        <div className="flex items-center gap-2 bg-red/5 border border-red/15 rounded-lg px-3 py-2.5">
                          <StatusIcon name="x" size={14} />
                          <div>
                            <p className="text-xs font-medium text-red">Payment Failed</p>
                            <p className="text-[10px] text-dark-5">
                              {payment.transactionId && <>TXN: <span className="font-mono">{payment.transactionId}</span></>}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    // PENDING
                    return (
                      <div className="flex items-center gap-2 bg-blue/5 border border-forest/15 rounded-lg px-3 py-2.5">
                        <StatusIcon name="clock" size={14} />
                        <div>
                          <p className="text-xs font-medium text-blue">Payment Submitted — Awaiting Verification</p>
                          <p className="text-[10px] text-dark-5">
                            ₹{payment.amount.toFixed(2)}
                            {payment.transactionId && <> &middot; TXN: <span className="font-mono">{payment.transactionId}</span></>}
                            &middot; {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Workflow */}
                <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-3">Order Workflow</h4>
                <WorkflowStepper
                  pipeline={PIPELINE}
                  statusMeta={STATUS_META}
                  currentStatus={order.status}
                  onAdvance={(next) => setConfirmTarget(next)}
                  onCancel={() => setConfirmTarget("CANCELLED")}
                  completedMessage="Order completed successfully! Invoice has been generated and emailed to the customer."
                  cancelledMessage="This order has been cancelled. Stock has been restored if applicable."
                />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmStatusModal
        isOpen={!!confirmTarget}
        title={`Order #${order.orderNumber}`}
        subtitle={`${order.customerName} — ₹${order.total.toFixed(2)}`}
        targetStatus={confirmTarget || ""}
        statusMeta={STATUS_META}
        warnings={ORDER_WARNINGS}
        onConfirm={handleConfirm}
        onClose={() => { setConfirmTarget(null); setVerificationNotes(""); setVerificationChecked(false); }}
        loading={updating}
        confirmDisabled={isPaymentVerification && !verificationChecked}
      >
        {isPaymentVerification && (() => {
          const payment = order.upi_payments?.[0];
          return (
            <div className="space-y-3">
              {/* Payment details to verify */}
              <div className="bg-gray-1 rounded-lg p-3 text-sm space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-2">Payment Details to Verify</p>
                <div className="flex justify-between">
                  <span className="text-dark-5">Amount</span>
                  <span className="text-dark font-medium">₹{payment?.amount?.toFixed(2) || order.total.toFixed(2)}</span>
                </div>
                {payment?.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-dark-5">Transaction ID</span>
                    <span className="text-dark font-mono text-xs">{payment.transactionId}</span>
                  </div>
                )}
                {payment?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-dark-5">Submitted</span>
                    <span className="text-dark">{new Date(payment.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
              </div>

              {/* Admin notes */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Verification Notes (optional)</label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Verified via bank statement, UPI ref matched..."
                  rows={2}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2 px-3 text-sm outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20 resize-none"
                />
              </div>

              {/* Checkbox — must confirm */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-lg p-3">
                <input
                  type="checkbox"
                  checked={verificationChecked}
                  onChange={(e) => setVerificationChecked(e.target.checked)}
                  className="h-4 w-4 mt-0.5 accent-forest rounded flex-shrink-0"
                />
                <span className="text-xs text-[#92400E] leading-relaxed">
                  I have verified this payment in the bank/UPI app and confirm the amount of <strong>₹{payment?.amount?.toFixed(2) || order.total.toFixed(2)}</strong> has been received.
                </span>
              </label>
            </div>
          );
        })()}
      </ConfirmStatusModal>
    </>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────
const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchOrders(); }, [page, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (selectedStatus) params.append("status", selectedStatus);
      const response = await fetch(`/api/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch { toast.error("Failed to fetch orders"); }
    finally { setLoading(false); }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
      </div>
    );
  }

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-dark mb-1">Order Management</h1>
            <p className="text-dark-5 text-sm">Manage and track all customer orders</p>
          </div>
          <button onClick={fetchOrders} className="inline-flex items-center gap-2 text-sm font-medium bg-forest text-white px-5 py-2.5 rounded-md hover:bg-dark transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setSelectedStatus(""); setPage(1); }} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedStatus ? "bg-forest text-white" : "bg-white shadow-1 text-dark-5 hover:text-dark"}`}>
          All Orders
        </button>
        {Object.keys(STATUS_META).map((status) => (
          <button key={status} onClick={() => { setSelectedStatus(status); setPage(1); }} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedStatus === status ? "bg-forest text-white" : "bg-white shadow-1 text-dark-5 hover:text-dark"}`}>
            {STATUS_META[status].label}
            {(statusCounts[status] || 0) > 0 && <span className="ml-1.5 opacity-60">({statusCounts[status]})</span>}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white shadow-1 rounded-[10px] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-forest/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h2 className="font-medium text-lg text-dark mb-1">No Orders Found</h2>
          <p className="text-dark-5 text-sm">{selectedStatus ? `No orders with status "${STATUS_META[selectedStatus]?.label}"` : "No orders have been placed yet."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={fetchOrders} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-sm font-medium text-dark-5 py-2 px-4 rounded-md border border-gray-3 hover:bg-gray-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <span className="text-sm text-dark-5">Page <span className="font-medium text-dark">{page}</span> of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm font-medium text-dark-5 py-2 px-4 rounded-md border border-gray-3 hover:bg-gray-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      )}
    </div>
  );
};

export default function ProtectedOrdersPage() {
  return <AdminAuthWrapper><OrdersPage /></AdminAuthWrapper>;
}
