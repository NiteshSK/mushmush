"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
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
      // CRITICAL: Filter orders by current user ID
      const userId = session?.user?.id;
      if (!userId) {
        console.error("No user ID found");
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
      
      // Fetch invoice details
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
      
      // Open PDF in new tab
      if (invoice.pdfPath) {
        window.open(invoice.pdfPath, '_blank');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    
    <div className="min-h-screen bg-gray-50 py-50">
      <div className="max-w-7xl mx-auto px-50 sm:px-10 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your mushroom orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          ₹{order.total.toFixed(2)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-light-6 text-green-dark' :
                          order.status === 'SHIPPED' ? 'bg-blue-light-4 text-blue' :
                          order.status === 'PROCESSING' ? 'bg-yellow-light-2 text-yellow-dark-2' :
                          order.status === 'CONFIRMED' ? 'bg-blue-light-5 text-blue-dark' :
                          order.status === 'PENDING' ? 'bg-gray-2 text-gray-7' :
                          order.status === 'CANCELLED' ? 'bg-red-light-6 text-red-dark' :
                          'bg-gray-2 text-gray-7'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadInvoice(order.id)}
                        disabled={downloadingInvoice === order.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green hover:bg-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download Invoice"
                      >
                        {downloadingInvoice === order.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                          </>
                        ) : (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Invoice
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {item.product.imgs && (
                            <img
                              src={item.product.imgs.thumbnails?.[0] || '/images/placeholder.jpg'}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.product.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{(item.quantity * item.price).toFixed(2)}
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
    </div>
  );
}
