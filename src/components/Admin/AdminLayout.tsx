"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Products', href: '/admin/products', icon: '📦' },
    { name: 'Inventory', href: '/admin/inventory', icon: '📋' },
    { name: 'Discounts', href: '/admin/discounts', icon: '🏷️' },
    { name: 'Coupons', href: '/admin/coupons', icon: '🎟️' },
    { name: 'Orders', href: '/admin/orders', icon: '🛒' },
    { name: 'Blogs', href: '/admin/blogs', icon: '📝' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-1">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2">
        <div className="flex h-16 items-center justify-center border-b border-gray-3">
          <h1 className="text-xl font-semibold text-dark">MushMush Admin</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue text-white'
                      : 'text-gray-6 hover:bg-gray-2 hover:text-dark'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
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
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-1 border-b border-gray-3">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-dark">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm text-blue hover:text-blue-dark font-medium"
                >
                  ← Back to Website
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
