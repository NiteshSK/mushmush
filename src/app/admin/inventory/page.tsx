"use client";
import React from 'react';
import ProductInventoryTable from '@/components/Admin/ProductInventoryTable';
import AdminAuthWrapper from '@/components/Admin/AdminAuthWrapper';

const InventoryPageContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-2">Inventory Management</h1>
        <p className="text-gray-6">
          Manage product stock status in real-time. Changes are applied immediately without requiring deployment.
        </p>
      </div>

      {/* Inventory Table */}
      <ProductInventoryTable />

      {/* Help Section */}
      <div className="bg-blue-light-5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-blue-dark space-y-1">
          <li>• Stock changes take effect immediately on the website</li>
          <li>• Out of stock products show "Notify Me" instead of "Add to Cart"</li>
          <li>• Products with active discounts are highlighted in the discount column</li>
          <li>• Use the search and filter features to find specific products quickly</li>
        </ul>
      </div>
    </div>
  );
};

export default function InventoryPage() {
  return (
    <AdminAuthWrapper>
      <InventoryPageContent />
    </AdminAuthWrapper>
  );
}
