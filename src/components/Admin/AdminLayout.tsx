"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navGroups = [
    {
      label: null,
      items: [
        { name: 'Dashboard', href: '/admin', icon: '📊' },
      ],
    },
    {
      label: 'Store',
      items: [
        { name: 'Products', href: '/admin/products', icon: '📦' },
        { name: 'Inventory', href: '/admin/inventory', icon: '📋' },
        { name: 'Orders', href: '/admin/orders', icon: '🛒' },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { name: 'Discounts', href: '/admin/discounts', icon: '🏷️' },
        { name: 'Coupons', href: '/admin/coupons', icon: '🎟️' },
        { name: 'Banners', href: '/admin/promotional-banners', icon: '🎨' },
      ],
    },
    {
      label: 'Content',
      items: [
        { name: 'Blogs', href: '/admin/blogs', icon: '📝' },
        { name: 'News', href: '/admin/news', icon: '📰' },
        { name: 'Tags', href: '/admin/tags', icon: '🔖' },
      ],
    },
    {
      label: 'Training',
      items: [
        { name: 'Programs', href: '/admin/training-programs', icon: '🎓' },
        { name: 'Registrations', href: '/admin/training-registrations', icon: '📋' },
        { name: 'Payments', href: '/admin/payment-verification', icon: '💳' },
      ],
    },
    {
      label: 'System',
      items: [
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
      ],
    },
  ];

  // Flat list for header title lookup
  const navigation = navGroups.flatMap(g => g.items);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-1">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-16 items-center justify-between border-b border-gray-3 px-4">
          <h1 className="text-xl font-semibold text-dark">MushMush Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-2 text-gray-6"
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-4 px-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
              {group.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-forest text-white'
                          : 'text-gray-6 hover:bg-gray-2 hover:text-dark'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {session?.user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark truncate">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-6 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full bg-red text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-red-dark transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-1 border-b border-gray-3">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Hamburger menu button — mobile only */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-2 text-gray-6 -ml-2"
                  aria-label="Open sidebar"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                </button>
                <h2 className="text-xl sm:text-2xl font-semibold text-dark">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm text-blue hover:text-blue-dark font-medium hidden sm:inline"
                >
                  ← Back to Website
                </Link>
                <Link
                  href="/"
                  className="text-sm text-blue hover:text-blue-dark font-medium sm:hidden"
                >
                  ← Site
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
