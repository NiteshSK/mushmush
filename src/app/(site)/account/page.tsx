"use client";
import { useSession, signOut } from "next-auth/react";
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
}

const statusStyle = (status: string) => {
  switch (status) {
    case "DELIVERED":
    case "COMPLETED":
      return "text-forest bg-forest/10";
    case "SHIPPED":
      return "text-blue bg-blue/10";
    case "PROCESSING":
      return "text-[#D97706] bg-[#FEF3C7]";
    case "CONFIRMED":
      return "text-forest bg-forest/10";
    case "PAYMENT_RECEIVED":
      return "text-blue bg-blue/10";
    case "CANCELLED":
      return "text-red bg-red/10";
    default:
      return "text-dark-5 bg-gray-1";
  }
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [memberSince, setMemberSince] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/orders?userId=${session.user.id}&limit=3`
        );
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

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/profile?email=${encodeURIComponent(session!.user!.email!)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.createdAt) {
            setMemberSince(new Date(data.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric'
            }));
          }
        }
      } catch {}
    };

    if (session?.user) {
      fetchRecentOrders();
      fetchProfile();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
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

  const userName = session.user?.name || "User";
  const userEmail = session.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <Breadcrumb title="My Account" pages={["My Account"]} />

      <section className="overflow-hidden py-20 bg-[#F6F7FB]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7.5">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-7.5">
              {/* Account Info Card */}
              <div className="bg-white shadow-1 rounded-lg overflow-hidden">
                <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                  <h2 className="font-medium text-xl text-dark">
                    Account Information
                  </h2>
                </div>
                <div className="p-4 sm:p-8.5">
                  <div className="flex items-center gap-5 mb-6">
                    <span className="w-14 h-14 rounded-full bg-forest text-white text-xl font-semibold flex items-center justify-center flex-shrink-0">
                      {userInitial}
                    </span>
                    <div>
                      <p className="font-medium text-dark">
                        {userName}
                      </p>
                      <p className="text-sm text-dark-5">{userEmail}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-1 rounded-lg p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-dark-5 mb-1">
                        Name
                      </p>
                      <p className="text-sm text-dark font-medium">
                        {userName}
                      </p>
                    </div>
                    <div className="bg-gray-1 rounded-lg p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-dark-5 mb-1">
                        Email
                      </p>
                      <p className="text-sm text-dark font-medium truncate">
                        {userEmail}
                      </p>
                    </div>
                    <div className="bg-gray-1 rounded-lg p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-dark-5 mb-1">
                        Member Since
                      </p>
                      <p className="text-sm text-dark font-medium">
                        {memberSince || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Card */}
              <div className="bg-white shadow-1 rounded-lg overflow-hidden">
                <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5 flex items-center justify-between">
                  <h2 className="font-medium text-xl text-dark">
                    Recent Orders
                  </h2>
                  <Link
                    href="/orders"
                    className="text-sm font-medium text-forest hover:text-dark transition-colors"
                  >
                    View all
                  </Link>
                </div>
                <div className="p-4 sm:p-8.5">
                  {loadingOrders ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
                    </div>
                  ) : recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <Link
                          key={order.id}
                          href="/orders"
                          className="block p-4 border border-gray-3 rounded-lg hover:border-forest/30 hover:bg-forest/5 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-dark truncate">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-xs text-dark-5 mt-1">
                                {new Date(
                                  order.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-4 flex-shrink-0 text-right">
                              <p className="text-sm font-semibold text-dark">
                                &#8377;{order.total.toFixed(2)}
                              </p>
                              <span
                                className={`inline-flex mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${statusStyle(order.status)}`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 bg-forest/10 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-forest"
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
                      <p className="text-dark-5 mb-4">No recent orders</p>
                      <Link
                        href="/shop"
                        className="inline-flex items-center bg-forest text-white text-sm font-medium py-2.5 px-6 rounded-md hover:bg-dark transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-7.5">
              {/* Quick Actions */}
              <div className="bg-white shadow-1 rounded-lg overflow-hidden">
                <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                  <h3 className="font-medium text-xl text-dark">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-2">
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-sm font-medium text-forest hover:bg-forest/5 rounded-lg border border-forest/20 hover:border-forest/40 transition-all"
                      >
                        <svg
                          className="w-5 h-5 text-forest flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-sm text-dark hover:bg-forest/5 rounded-lg border border-gray-3 hover:border-forest/20 transition-all"
                    >
                      <svg
                        className="w-5 h-5 text-dark-5 flex-shrink-0"
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
                      View Orders
                    </Link>

                    <Link
                      href="/addresses"
                      className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-sm text-dark hover:bg-forest/5 rounded-lg border border-gray-3 hover:border-forest/20 transition-all"
                    >
                      <svg
                        className="w-5 h-5 text-dark-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      My Addresses
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-sm text-dark hover:bg-forest/5 rounded-lg border border-gray-3 hover:border-forest/20 transition-all"
                    >
                      <svg
                        className="w-5 h-5 text-dark-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      Wishlist
                    </Link>

                    <Link
                      href="/shop"
                      className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-sm text-dark hover:bg-forest/5 rounded-lg border border-gray-3 hover:border-forest/20 transition-all"
                    >
                      <svg
                        className="w-5 h-5 text-dark-5 flex-shrink-0"
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
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <div className="bg-white shadow-1 rounded-lg overflow-hidden">
                <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                  <h3 className="font-medium text-xl text-dark">Account</h3>
                </div>
                <div className="p-4 sm:p-6">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-sm text-red hover:bg-red/5 rounded-lg border border-gray-3 hover:border-red/20 transition-all"
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
