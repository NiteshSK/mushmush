"use client";
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import AdminAuthWrapper from '@/components/Admin/AdminAuthWrapper';

type Product = {
  id: number;
  title: string;
  slug: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
  measurementValue: number;
  measurementType: string;
  imgs: { thumbnails: string[]; previews: string[] };
  categoryNames: string[];
  stockQuantity: number;
  bulkDisplay: string;
  reviewCount: number;
  averageRating: number;
  hasActiveDiscount: boolean;
  activeDiscountValue: number;
};

type FilterTab = 'all' | 'in-stock' | 'out-of-stock' | 'featured' | 'discounted';
type SortKey = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name' | 'stock-low';

const ProductsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [togglingFeatured, setTogglingFeatured] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const toggleFeatured = useCallback(async (productId: number, current: boolean) => {
    setTogglingFeatured(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'featured', value: !current }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, featured: !current } : p));
        toast.success(current ? 'Removed from featured' : 'Marked as featured');
      } else {
        toast.error('Failed to update');
      }
    } catch {
      toast.error('Error updating product');
    } finally {
      setTogglingFeatured(null);
    }
  }, []);

  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    featured: products.filter(p => p.featured).length,
  }), [products]);

  const filtered = useMemo(() => {
    let list = products;

    // Tab filter
    switch (activeTab) {
      case 'in-stock': list = list.filter(p => p.inStock); break;
      case 'out-of-stock': list = list.filter(p => !p.inStock); break;
      case 'featured': list = list.filter(p => p.featured); break;
      case 'discounted': list = list.filter(p => p.hasActiveDiscount); break;
    }

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.categoryNames.some(c => c.toLowerCase().includes(q))
      );
    }

    // Sort
    const sorted = [...list];
    switch (sortBy) {
      case 'newest': sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'oldest': sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
      case 'name': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'stock-low': sorted.sort((a, b) => a.stockQuantity - b.stockQuantity); break;
    }

    return sorted;
  }, [products, query, activeTab, sortBy]);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'in-stock', label: 'In Stock', count: stats.inStock },
    { key: 'out-of-stock', label: 'Out of Stock', count: stats.outOfStock },
    { key: 'featured', label: 'Featured', count: stats.featured },
    { key: 'discounted', label: 'Discounted', count: products.filter(p => p.hasActiveDiscount).length },
  ];

  const isNew = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    return diff < 14 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Products</h1>
          <p className="text-sm text-gray-6 mt-0.5">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest/90 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: stats.total, color: 'bg-blue/10 text-blue' },
          { label: 'In Stock', value: stats.inStock, color: 'bg-green/10 text-green' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'bg-red/10 text-red' },
          { label: 'Featured', value: stats.featured, color: 'bg-yellow/10 text-yellow' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-1 p-4">
            <p className="text-xs font-medium text-gray-6 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color.split(' ')[1]}`}>{loading ? '-' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search Bar */}
      <div className="bg-white rounded-xl shadow-1">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-forest text-white'
                  : 'text-gray-6 hover:bg-gray-2 hover:text-dark'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-white/70' : 'text-gray-5'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3 p-4 border-t border-gray-3 mt-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or categories..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-2 text-sm border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-low">Stock: Low First</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest mx-auto mb-3"></div>
              <p className="text-sm text-gray-6">Loading products...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">
              {query ? '🔍' : '📦'}
            </div>
            <p className="text-gray-6 font-medium">
              {query ? 'No products match your search' : 'No products found'}
            </p>
            {query && (
              <button onClick={() => setQuery('')} className="text-sm text-forest mt-2 hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-3 bg-gray-1">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-6 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-6 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-6 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-6 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-6 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-6 uppercase tracking-wider">Featured</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-6 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-1 transition-colors group">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-2">
                          {p.imgs?.thumbnails?.[0] ? (
                            <Image
                              src={p.imgs.thumbnails[0]}
                              alt={p.title}
                              width={40}
                              height={40}
                              className="h-10 w-10 object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-5 text-lg">📦</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-dark truncate max-w-[200px]">{p.title}</span>
                            {isNew(p.createdAt) && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-forest/10 text-forest rounded">NEW</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-5 mt-0.5">
                            {p.measurementValue}{p.measurementType}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.categoryNames.length > 0 ? (
                          p.categoryNames.slice(0, 2).map(c => (
                            <span key={c} className="inline-block px-2 py-0.5 text-xs bg-gray-2 text-gray-6 rounded-full">{c}</span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-5 italic">None</span>
                        )}
                        {p.categoryNames.length > 2 && (
                          <span className="text-xs text-gray-5">+{p.categoryNames.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-dark">
                        ₹{p.price}
                      </div>
                      {p.hasActiveDiscount && (
                        <span className="text-[10px] font-semibold text-green">{p.activeDiscountValue}% OFF</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.inStock
                          ? p.stockQuantity <= 5
                            ? 'bg-yellow/10 text-yellow'
                            : 'bg-green/10 text-green'
                          : 'bg-red/10 text-red'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.inStock
                            ? p.stockQuantity <= 5 ? 'bg-yellow' : 'bg-green'
                            : 'bg-red'
                        }`} />
                        {p.inStock
                          ? p.stockQuantity <= 5
                            ? `Low (${p.stockQuantity})`
                            : `${p.stockQuantity} packs`
                          : 'Out'
                        }
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      {p.reviewCount > 0 ? (
                        <div className="text-sm">
                          <span className="text-yellow">★</span>
                          <span className="font-medium text-dark ml-0.5">{p.averageRating.toFixed(1)}</span>
                          <span className="text-gray-5 text-xs ml-1">({p.reviewCount})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-5">No reviews</span>
                      )}
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(p.id, p.featured)}
                        disabled={togglingFeatured === p.id}
                        className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors ${
                          p.featured
                            ? 'bg-yellow/15 text-yellow hover:bg-yellow/25'
                            : 'bg-gray-2 text-gray-5 hover:bg-gray-3 hover:text-gray-6'
                        } ${togglingFeatured === p.id ? 'opacity-50' : ''}`}
                        title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        {p.featured ? '★' : '☆'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-forest bg-forest/10 rounded-lg hover:bg-forest/20 transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/shop-details/${p.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 text-xs font-medium text-gray-6 bg-gray-2 rounded-lg hover:bg-gray-3 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-3 bg-gray-1">
            <p className="text-xs text-gray-5">
              Showing {filtered.length} of {products.length} products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProtectedProductsPage() {
  return <AdminAuthWrapper><ProductsPage /></AdminAuthWrapper>;
}
