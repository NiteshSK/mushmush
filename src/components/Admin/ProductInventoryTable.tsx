"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  imgs: {
    thumbnails: string[];
  };
  categoryNames: string[];
  reviewCount: number;
  averageRating: number;
  hasActiveDiscount: boolean;
  activeDiscountValue: number;
}

const ProductInventoryTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (productId: number, currentStock: boolean) => {
    setUpdating(productId);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          inStock: !currentStock,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(prev =>
          prev.map(product =>
            product.id === productId
              ? { ...product, inStock: !currentStock }
              : product
          )
        );
        toast.success(result.message);
      } else {
        toast.error('Failed to update product stock');
      }
    } catch (error) {
      toast.error('Error updating product stock');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-6">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-1 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-3">
        <h3 className="text-lg font-semibold text-dark">Product Inventory Management</h3>
        <p className="text-sm text-gray-6 mt-1">
          Manage product stock status. Changes take effect immediately.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-1">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-6 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-6 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-6 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-6 uppercase tracking-wider">
                Reviews
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-6 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-6 uppercase tracking-wider">
                Stock Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-6 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-3">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-1">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      <Image
                        src={product.imgs.thumbnails[0]}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-dark">
                        {product.title}
                      </div>
                      <div className="text-sm text-gray-6">
                        ID: {product.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-6">
                    {product.categoryNames.join(', ') || 'Uncategorized'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-dark">
                    ₹{product.price}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-6">
                    {product.reviewCount} reviews
                  </div>
                  <div className="text-xs text-yellow">
                    ⭐ {product.averageRating.toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.hasActiveDiscount ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-light-5 text-green">
                      {product.activeDiscountValue}% OFF
                    </span>
                  ) : (
                    <span className="text-sm text-gray-5">No discount</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.inStock
                        ? 'bg-green-light-5 text-green'
                        : 'bg-red-light-5 text-red'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => toggleStock(product.id, product.inStock)}
                    disabled={updating === product.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      product.inStock
                        ? 'bg-red-light-6 text-red hover:bg-red-light-5'
                        : 'bg-green-light-6 text-green hover:bg-green-light-5'
                    } ${updating === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updating === product.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-6">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductInventoryTable;
