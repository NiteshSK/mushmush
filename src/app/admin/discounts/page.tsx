"use client";
import React from 'react';

const DiscountsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-2">Discount Management</h1>
        <p className="text-gray-6">
          Manage product discounts and promotional offers.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-1 p-12 text-center">
        <div className="text-6xl mb-4">🏷️</div>
        <h2 className="text-xl font-semibold text-dark mb-2">Discount Management</h2>
        <p className="text-gray-6 mb-6">
          Advanced discount management features are being developed.
        </p>
        <div className="bg-gray-1 rounded-lg p-4 text-left max-w-md mx-auto">
          <h3 className="font-medium text-dark mb-2">Planned Features:</h3>
          <ul className="text-sm text-gray-6 space-y-1">
            <li>• Create/Edit/Delete discounts</li>
            <li>• Percentage and fixed amount discounts</li>
            <li>• Discount scheduling</li>
            <li>• Bulk discount operations</li>
            <li>• Discount analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiscountsPage;
