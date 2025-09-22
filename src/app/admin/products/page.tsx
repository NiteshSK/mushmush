"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Product = {
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
  slug: string;
};

const ProductsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch('/api/products?limit=50')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    return products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-1 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-dark mb-1">Product Management</h1>
          <p className="text-gray-6">Create, edit and manage products, content and images.</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center px-4 py-2 rounded-md bg-blue text-white">+ New Product</Link>
      </div>

      <div className="bg-white rounded-lg shadow-1 p-4 flex items-center gap-3">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by title" className="flex-1 border rounded-md px-3 py-2" />
      </div>

      <div className="bg-white rounded-lg shadow-1">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{p.id}</td>
                    <td className="p-3">{p.title}</td>
                    <td className="p-3">₹{p.price}</td>
                    <td className="p-3">{p.inStock ? 'In Stock' : 'Out of Stock'}</td>
                    <td className="p-3">{p.featured ? 'Yes' : 'No'}</td>
                    <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-blue mr-4">Edit</Link>
                      <Link href={`/shop-details/${p.slug}`} className="text-gray-600">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
