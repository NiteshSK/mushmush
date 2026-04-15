"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
      imgs: any;
    };
  }[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  pdfPath: string;
  emailSent: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  PENDING: { label: "Awaiting Payment", style: "text-dark-5 bg-gray-1" },
  PAYMENT_RECEIVED: { label: "Payment Received", style: "text-blue bg-blue/10" },
  CONFIRMED: { label: "Confirmed", style: "text-forest bg-forest/10" },
  PROCESSING: { label: "Being Prepared", style: "text-[#D97706] bg-[#FEF3C7]" },
  SHIPPED: { label: "Shipped", style: "text-blue bg-blue/10" },
  DELIVERED: { label: "Delivered", style: "text-forest bg-forest/10" },
  COMPLETED: { label: "Completed", style: "text-forest bg-forest/10" },
  CANCELLED: { label: "Cancelled", style: "text-red bg-red/10" },
};

const getStatus = (status: string) => STATUS_CONFIG[status] || { label: status, style: "text-dark-5 bg-gray-1" };

const INVOICE_ALLOWED_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      fetchOrders();
    }
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/orders?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setDownloadingInvoice(orderId);

      const response = await fetch(`/api/orders/${orderId}/invoice`);

      if (!response.ok) {
        if (response.status === 404) {
          alert("Invoice not available yet. It will be generated shortly.");
        } else {
          alert("Failed to download invoice. Please try again.");
        }
        return;
      }

      const invoice: Invoice = await response.json();

      if (invoice.pdfPath) {
        window.open(invoice.pdfPath, "_blank");
      } else {
        alert("Invoice PDF not available yet.");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Breadcrumb title="My Orders" pages={["My Orders"]} />

      <section className="overflow-hidden py-20 bg-[#F6F7FB]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white shadow-1 rounded-[10px] p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-5 bg-forest/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-forest"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-lg text-dark mb-2">
                No orders yet
              </h3>
              <p className="text-dark-5 mb-6">
                You haven't placed any orders yet. Start shopping to see your
                orders here.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center bg-forest text-white text-sm font-medium py-2.5 px-6 rounded-md hover:bg-dark transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white shadow-1 rounded-[10px] overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="border-b border-gray-3 py-4 px-4 sm:px-8.5">
                    {/* Mobile */}
                    <div className="block sm:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-dark">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-xs text-dark-5 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${getStatus(order.status).style}`}
                        >
                          {getStatus(order.status).label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-dark">
                          &#8377;{order.total.toFixed(2)}
                        </p>
                        {INVOICE_ALLOWED_STATUSES.includes(order.status) ? (
                          <button
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={downloadingInvoice === order.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-forest bg-forest/10 py-1.5 px-3 rounded-md hover:bg-forest/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingInvoice === order.id ? (
                              <>
                                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                              </>
                            ) : (
                              <>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Invoice
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">
                            Invoice available once payment is verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-lg text-dark">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-dark-5">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="text-lg font-medium text-dark">
                            &#8377;{order.total.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${getStatus(order.status).style}`}
                          >
                            {getStatus(order.status).label}
                          </span>
                        </div>
                        {INVOICE_ALLOWED_STATUSES.includes(order.status) ? (
                          <button
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={downloadingInvoice === order.id}
                            className="inline-flex items-center gap-2 text-sm font-medium text-forest bg-forest/10 py-2.5 px-5 rounded-md hover:bg-forest/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingInvoice === order.id ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Invoice
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic py-2.5 px-5">
                            Invoice available once payment is verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-8.5">
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 sm:gap-4"
                        >
                          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gray-1 rounded-[10px] overflow-hidden">
                            {item.product.imgs && (
                              <img
                                src={
                                  item.product.imgs.thumbnails?.[0] ||
                                  "/images/placeholder.jpg"
                                }
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-dark truncate">
                              {item.product.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-dark-5">
                              Qty: {item.quantity} &times; &#8377;{item.price}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-dark whitespace-nowrap">
                            &#8377;{(item.quantity * item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
