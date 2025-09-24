"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TrainingProgramsAdmin from "@/components/Admin/TrainingPrograms";
import PaymentVerification from "@/components/Admin/PaymentVerification";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";
import FestiveEffectsToggle from "@/components/Admin/FestiveEffectsToggle";

console.log('🎉 Admin page: FestiveEffectsToggle imported');

interface DashboardStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  productsWithDiscounts: number;
  totalOrders: number;
  totalUsers: number;
}

const AdminDashboardContent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    productsWithDiscounts: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const products = await response.json();
        setStats({
          totalProducts: products.length,
          inStockProducts: products.filter((p: any) => p.inStock).length,
          outOfStockProducts: products.filter((p: any) => !p.inStock).length,
          productsWithDiscounts: products.filter((p: any) => p.hasActiveDiscount).length,
          totalOrders: 0, // TODO: Implement when orders API is ready
          totalUsers: 0, // TODO: Implement when users API is ready
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'bg-blue-light-5 text-blue',
      link: '/admin/products'
    },
    {
      title: 'In Stock',
      value: stats.inStockProducts,
      icon: '✅',
      color: 'bg-green-light-5 text-green',
      link: '/admin/inventory'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockProducts,
      icon: '❌',
      color: 'bg-red-light-5 text-red',
      link: '/admin/inventory'
    },
    {
      title: 'With Discounts',
      value: stats.productsWithDiscounts,
      icon: '🏷️',
      color: 'bg-yellow-light-2 text-yellow-dark',
      link: '/admin/discounts'
    },
  ];

  const quickActions = [
    {
      title: 'Manage Inventory',
      description: 'Update product stock status',
      icon: '📋',
      link: '/admin/inventory',
      color: 'bg-blue'
    },
    {
      title: 'View Products',
      description: 'Browse all products',
      icon: '📦',
      link: '/admin/products',
      color: 'bg-green'
    },
    {
      title: 'Promotional Banners',
      description: 'Manage promotional banners',
      icon: '🎨',
      link: '/admin/promotional-banners',
      color: 'bg-purple'
    },
    {
      title: 'Manage Discounts',
      description: 'Update product discounts',
      icon: '🏷️',
      link: '/admin/discounts',
      color: 'bg-yellow'
    },
    {
      title: 'View Orders',
      description: 'Check recent orders',
      icon: '🛒',
      link: '/admin/orders',
      color: 'bg-teal'
    },
    {
      title: 'Training Programs',
      description: 'Manage training programs',
      icon: '🎓',
      link: '/admin/training-programs',
      color: 'bg-indigo'
    },
    {
      title: 'Training Registrations',
      description: 'View training registrations',
      icon: '📝',
      link: '/admin/training-registrations',
      color: 'bg-pink'
    },
    {
      title: 'Payment Verification',
      description: 'Verify UPI payments',
      icon: '💳',
      link: '/admin/payment-verification',
      color: 'bg-orange'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-6">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-2">Welcome to MushMush Admin</h1>
        <p className="text-gray-6">
          Manage your e-commerce store efficiently. Quick access to inventory, products, and more.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className="bg-white rounded-lg shadow-1 p-6 hover:shadow-2 transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-6">{card.title}</p>
                <p className="text-3xl font-semibold text-dark mt-2">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Festive Effects Toggle */}
      <FestiveEffectsToggle />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h2 className="text-lg font-semibold text-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.link}
              className="group p-4 rounded-lg border border-gray-3 hover:border-blue transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} text-white flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-medium text-dark mb-1">{action.title}</h3>
              <p className="text-sm text-gray-6">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h2 className="text-lg font-semibold text-dark mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-6">Activity tracking coming soon...</p>
          <p className="text-sm text-gray-5 mt-2">
            This section will show recent inventory changes, orders, and system updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <AdminAuthWrapper>
      <AdminDashboardContent />
    </AdminAuthWrapper>
  );
}
