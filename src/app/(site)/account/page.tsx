"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status, router]);

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/orders?userId=${session.user.id}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setRecentOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (session?.user) {
      fetchRecentOrders();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
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
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 mb-25">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{session.user?.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{session.user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Link 
                  href="/orders"
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href="/orders"
                      className="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{order.total.toFixed(2)}
                          </p>
                          <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">No recent orders</p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    View Orders
                  </div>
                </Link>

                <Link
                  href="/addresses"
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    My Addresses
                  </div>
                </Link>
                
                <Link
                  href="/wishlist"
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist
                  </div>
                </Link>

                <Link
                  href="/shop"
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Continue Shopping
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
