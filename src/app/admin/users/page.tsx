"use client";
import React from 'react';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-2">User Management</h1>
        <p className="text-gray-6">
          Manage user accounts and permissions.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-1 p-12 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-xl font-semibold text-dark mb-2">User Management</h2>
        <p className="text-gray-6 mb-6">
          User management features are being developed.
        </p>
        <div className="bg-gray-1 rounded-lg p-4 text-left max-w-md mx-auto">
          <h3 className="font-medium text-dark mb-2">Planned Features:</h3>
          <ul className="text-sm text-gray-6 space-y-1">
            <li>• View all users</li>
            <li>• Role management</li>
            <li>• User activity tracking</li>
            <li>• Account status management</li>
            <li>• User analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
