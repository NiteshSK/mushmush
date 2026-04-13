"use client";
import React from 'react';
import ProductInventoryTable from '@/components/Admin/ProductInventoryTable';
import AdminAuthWrapper from '@/components/Admin/AdminAuthWrapper';

const InventoryPageContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-2">Inventory Management</h1>
        <p className="text-gray-6">
          Manage product stock status in real-time. Changes are applied immediately without requiring deployment.
        </p>
      </div>

      {/* Inventory Table */}
      <ProductInventoryTable />

      {/* Help Section */}
      <div className="bg-blue-light-5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-forest mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-blue-dark space-y-1">
          <li>• Set product quantity to control how many units can be ordered</li>
          <li>• Products are automatically marked out of stock when quantity reaches 0</li>
          <li>• Quantity is decremented automatically when orders are placed</li>
          <li>• Out of stock products show "Notify Me" instead of "Add to Cart"</li>
          <li>• Low stock items (5 or fewer) are highlighted in yellow</li>
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
