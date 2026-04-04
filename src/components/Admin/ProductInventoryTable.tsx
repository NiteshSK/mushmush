"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  bulkQuantity: number;
  bulkDisplay: string;
  measurementValue: number;
  measurementType: string;
  imgs: {
    thumbnails: string[];
  };
  categoryNames: string[];
  reviewCount: number;
  averageRating: number;
  hasActiveDiscount: boolean;
  activeDiscountValue: number;
}

/** Convert admin input to base units (grams or ml) */
function toBaseUnits(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'kg': return value * 1000;
    case 'gm': case 'g': return value;
    case 'l': case 'litre': return value * 1000;
    case 'ml': return value;
    default: return value;
  }
}

/** Get the convenient input unit for a measurement type */
function getInputUnit(measurementType: string): string {
  switch (measurementType.toLowerCase()) {
    case 'gm': case 'g': return 'kg';
    case 'kg': return 'kg';
    case 'ml': return 'L';
    case 'l': case 'litre': return 'L';
    default: return measurementType;
  }
}

/** Convert base units to the convenient input unit */
function fromBaseUnits(baseValue: number, inputUnit: string): number {
  switch (inputUnit.toLowerCase()) {
    case 'kg': return baseValue / 1000;
    case 'l': return baseValue / 1000;
    default: return baseValue;
  }
}

const ProductInventoryTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');

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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Trying to mark IN STOCK but quantity is 0 → block and prompt to update quantity first
    const packs = product.stockQuantity ?? 0;
    if (!currentStock && packs <= 0) {
      alert('Cannot mark in stock — quantity is 0.\n\nPlease update the quantity first.');
      startEditingQuantity(productId, product.bulkQuantity || 0, product.measurementType);
      return;
    }

    // Trying to mark OUT OF STOCK but there's still stock → confirm first
    if (currentStock && packs > 0) {
      const confirmed = window.confirm(
        `"${product.title}" still has ${packs} pack(s) in stock (${product.bulkDisplay || '0 gm'}).\n\nAre you sure you want to mark it as out of stock?`
      );
      if (!confirmed) return;
    }

    setUpdating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: 'inStock',
          value: !currentStock,
        }),
      });

      if (response.ok) {
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, inStock: !currentStock }
              : p
          )
        );
        toast.success(`Product ${!currentStock ? 'marked In Stock' : 'marked Out of Stock'}`);
      } else {
        toast.error('Failed to update product stock');
      }
    } catch (error) {
      toast.error('Error updating product stock');
    } finally {
      setUpdating(null);
    }
  };

  const updatePrice = async (productId: number, price: string) => {
    if (!price || isNaN(parseFloat(price))) {
      toast.error('Please enter a valid price');
      return;
    }

    setUpdating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: 'price',
          value: parseFloat(price),
        }),
      });

      if (response.ok) {
        setProducts(prev =>
          prev.map(product =>
            product.id === productId
              ? { ...product, price: parseFloat(price) }
              : product
          )
        );
        toast.success('Product price updated successfully');
        setEditingPrice(null);
        setNewPrice('');
      } else {
        toast.error('Failed to update product price');
      }
    } catch (error) {
      toast.error('Error updating product price');
    } finally {
      setUpdating(null);
    }
  };

  const updateQuantity = async (productId: number, quantity: string, unit: string) => {
    const inputVal = parseFloat(quantity);
    if (isNaN(inputVal) || inputVal < 0) {
      toast.error('Please enter a valid quantity (0 or more)');
      return;
    }

    const baseUnits = toBaseUnits(inputVal, unit);
    const product = products.find(p => p.id === productId);
    const packSize = product ? toBaseUnits(product.measurementValue, product.measurementType) : 1;
    const packs = Math.floor(baseUnits / packSize);

    setUpdating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'quantity', value: baseUnits }),
      });

      if (response.ok) {
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, bulkQuantity: baseUnits, stockQuantity: packs, inStock: packs > 0 }
              : p
          )
        );
        toast.success(`Stock updated to ${inputVal} ${unit} (${packs} packs)`);
        setEditingQuantity(null);
        setNewQuantity('');
      } else {
        toast.error('Failed to update stock quantity');
      }
    } catch (error) {
      toast.error('Error updating stock quantity');
    } finally {
      setUpdating(null);
    }
  };

  const startEditingQuantity = (productId: number, bulkQuantity: number, measurementType: string) => {
    const unit = getInputUnit(measurementType);
    setEditingQuantity(productId);
    setQuantityUnit(unit);
    setNewQuantity(fromBaseUnits(bulkQuantity, unit).toString());
  };

  const cancelEditingQuantity = () => {
    setEditingQuantity(null);
    setNewQuantity('');
  };

  const startEditingPrice = (productId: number, currentPrice: number) => {
    setEditingPrice(productId);
    setNewPrice(currentPrice.toString());
  };

  const cancelEditingPrice = () => {
    setEditingPrice(null);
    setNewPrice('');
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
                Quantity
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
                  {editingPrice === product.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-3 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                        step="0.01"
                        min="0"
                      />
                      <button
                        onClick={() => updatePrice(product.id, newPrice)}
                        disabled={updating === product.id}
                        className="px-2 py-1 text-xs bg-green text-white rounded hover:bg-green-dark disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditingPrice}
                        className="px-2 py-1 text-xs bg-gray-5 text-white rounded hover:bg-gray-6"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-dark">
                        ₹{product.price}
                      </div>
                      <button
                        onClick={() => startEditingPrice(product.id, product.price)}
                        className="text-xs text-blue hover:text-blue-dark"
                        title="Edit price"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
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
                  {editingQuantity === product.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-3 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                        min="0"
                        step="0.1"
                      />
                      <select
                        value={quantityUnit}
                        onChange={(e) => setQuantityUnit(e.target.value)}
                        className="px-1 py-1 text-sm border border-gray-3 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                      >
                        <option value="gm">gm</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="L">L</option>
                      </select>
                      <button
                        onClick={() => updateQuantity(product.id, newQuantity, quantityUnit)}
                        disabled={updating === product.id}
                        className="px-2 py-1 text-xs bg-green text-white rounded hover:bg-green-dark disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditingQuantity}
                        className="px-2 py-1 text-xs bg-gray-5 text-white rounded hover:bg-gray-6"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${product.stockQuantity === 0 ? 'text-red' : product.stockQuantity <= 5 ? 'text-yellow' : 'text-dark'}`}>
                          {product.bulkDisplay || '0 gm'}
                        </span>
                        <button
                          onClick={() => startEditingQuantity(product.id, product.bulkQuantity || 0, product.measurementType)}
                          className="text-xs text-blue hover:text-blue-dark"
                          title="Edit quantity"
                        >
                          ✏️
                        </button>
                      </div>
                      <span className="text-xs text-gray-5">
                        {product.stockQuantity} packs of {product.measurementValue}{product.measurementType}
                      </span>
                    </div>
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
