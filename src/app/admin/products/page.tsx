"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams,useRouter } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
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
  const search=useSearchParams(), router=useRouter();
  const params=search.toString();
  const page=Math.max(1,Number(search.get("page"))||1);
  const activeTab=(search.get("tab")||"all") as FilterTab, sortBy=(search.get("sortBy")||"newest") as SortKey;
  const query=search.get("q")||"";
  const [total,setTotal]=useState(0), [pages,setPages]=useState(1), [error,setError]=useState(""), [revision,reload]=useState(0);
  const [togglingFeatured, setTogglingFeatured] = useState<number | null>(null);
  function filter(key:string,value:string) {
    const next=new URLSearchParams(params);
    if(key!=="page") next.delete("page");
    if(value) next.set(key,value); else next.delete(key);
    router.replace("/admin/products?"+next.toString(),{scroll:false});
  }
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true); setError("");
    const request=new URLSearchParams({page:String(page),limit:"25",q:query});
    if(activeTab==="in-stock"||activeTab==="out-of-stock") request.set("stock",activeTab==="in-stock"?"in":"out");
    if(activeTab==="featured") request.set("featured","1");
    if(activeTab==="discounted") request.set("discount","1");
    const sort=sortBy.startsWith("price")?"price":sortBy==="name"?"title":sortBy==="stock-low"?"stock":"createdAt";
    request.set("sort",sort); request.set("direction",sortBy==="newest"||sortBy==="price-desc"?"desc":"asc");
    fetch("/api/admin/products?"+request.toString(),{signal:controller.signal}).then(async r=>{
      if(!r.ok) throw Error("Could not load products.");
      const data=await r.json();
      if(!controller.signal.aborted){setProducts(data.products);setTotal(data.total);setPages(data.totalPages);}
    }).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[activeTab,sortBy,query,page,revision]);
  async function archiveProduct(p:Product) {
    if(!window.confirm("Archive “"+p.title+"” and remove it from shopping? Existing order lines will be kept.")) return;
    try{
      const r=await fetch("/api/products/"+p.id,{method:"DELETE"});
      if(!r.ok) throw Error("Could not archive this product.");
      if(products.length===1 && page>1) filter("page",String(page-1)); else reload(n=>n+1);
    }catch(e){setError(e instanceof Error?e.message:"Archive failed.");}
  }

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

  const filtered=products;
  const tabs: {key:FilterTab; label:string}[] = [
    {key:"all",label:"All"},{key:"in-stock",label:"In stock"},{key:"out-of-stock",label:"Out of stock"},
    {key:"featured",label:"Featured"},{key:"discounted",label:"Discounted"}
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

      {pages>1 && <nav aria-label="Catalog pages" className="flex gap-4"><button disabled={page<=1} onClick={()=>filter("page",String(page-1))}>Previous</button><button disabled={page>=pages} onClick={()=>filter("page",String(page+1))}>Next</button></nav>}
      {/* Filters + Search Bar */}
      <div className="bg-white rounded-xl shadow-1">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => filter("tab",tab.key)}
              className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-forest text-white'
                  : 'text-gray-6 hover:bg-gray-2 hover:text-dark'
              }`}
            >
              {tab.label}
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
              key={query} defaultValue={query} aria-label="Search products"
              onKeyDown={e=>{if(e.key==="Enter")filter("q",e.currentTarget.value.trim());}}
              placeholder="Search products, then press Enter"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => filter("sortBy",e.target.value)}
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
        ) : error ? <p role="alert" className="p-4">{error} <button onClick={()=>reload(n=>n+1)}>Retry</button></p> : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">
              {query ? '🔍' : '📦'}
            </div>
            <p className="text-gray-6 font-medium">
              {query ? 'No products match your search' : 'No products found'}
            </p>
            {query && (
              <button onClick={() => filter('q','')} className="text-sm text-forest mt-2 hover:underline">
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
                        <span className="text-[10px] font-semibold text-green">Discount live</span>
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
                        <button className="text-sm underline ml-2" onClick={()=>archiveProduct(p)}>Archive</button>
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
              {total} products · Page {page} of {Math.max(1,pages)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProtectedProductsPage() {
  return <><ProductsPage /></>;
}
