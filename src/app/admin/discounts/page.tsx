"use client";
import { effectiveUnitPrice } from "@/lib/product-pricing";
import { indiaLocalInput, promotionState } from "@/lib/promotion-schedule";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
interface Product {
  id: number;
  title: string;
  price: number;
}

interface Discount {
  id: number;
  productId: number;
  updatedAt: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  product: Product;
}

const DiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: '',
    isActive: true,
    startDate: indiaLocalInput(new Date().toISOString()).slice(0,10),
    endDate: ''
  });

  useEffect(() => {
    fetchDiscounts();

  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/admin/discounts');
      if (!response.ok) throw new Error('Failed to fetch discounts');
      const data = await response.json();
      setDiscounts(data.discounts);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const [pickerPage,setPickerPage] = useState(1);
  const [pickerPages,setPickerPages] = useState(1);
  useEffect(() => {
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      try {
        const query=new URLSearchParams({q:productQuery,page:String(pickerPage),limit:"25"});
        const r=await fetch("/api/products/search?"+query,{signal:controller.signal});
        if(!r.ok) throw Error();
        const data=await r.json();
        if(controller.signal.aborted)return;
        const found:Product[]=data.products;
        setProducts(editingDiscount && !found.some(p=>p.id===editingDiscount.productId) ? [editingDiscount.product,...found] : found);
        setPickerPages(data.pagination.totalPages);
      }catch {if(!controller.signal.aborted)toast.error("Product search failed.");}
    },200);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[productQuery,pickerPage,editingDiscount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.value) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const url = editingDiscount 
        ? `/api/admin/discounts/${editingDiscount.id}`
        : '/api/admin/discounts';
      
      const method = editingDiscount ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData,expectedUpdatedAt:editingDiscount?.updatedAt,startDate:formData.startDate+"T00:00:00+05:30",endDate:formData.endDate ? formData.endDate+"T23:59:59.999+05:30":null})
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save discount');
      }

      toast.success(editingDiscount ? 'Discount updated!' : 'Discount created!');
      setShowCreateForm(false);
      setEditingDiscount(null);
      resetForm();
      fetchDiscounts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      productId: discount.productId.toString(),
      type: discount.type,
      value: discount.value.toString(),
      isActive: discount.isActive,
      startDate: indiaLocalInput(discount.startDate).slice(0,10),
      endDate: discount.endDate ? indiaLocalInput(discount.endDate).slice(0,10) : ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (discountId: number) => {
    if (!confirm('Disable this discount and retain its history?')) return;

    try {
      const response = await fetch(`/api/admin/discounts/${discountId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete discount');

      toast.success('Discount disabled.');
      fetchDiscounts();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'PERCENTAGE',
      value: '',
      isActive: true,
      startDate: indiaLocalInput(new Date().toISOString()).slice(0,10),
      endDate: ''
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-3 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-3 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-dark mb-2">Discount Management</h1>
            <p className="text-gray-6">
              Manage product discounts and promotional offers.
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingDiscount(null);
              resetForm();
            }}
            className="bg-forest text-white px-4 py-2 rounded-md hover:bg-dark-dark transition-colors"
          >
            Create Discount
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-xl font-semibold text-dark mb-4">
            {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Product *
                </label>
                <input aria-label="Find a product" className="block w-full border p-2" placeholder="Find a product by name" value={productQuery} onChange={e=>{setProductQuery(e.target.value);setPickerPage(1);}}/>
                <select
                  disabled={!!editingDiscount}
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/20"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} (₹{product.price})
                    </option>
                  ))}
                </select>
                {pickerPages>1 && <div className="flex gap-3"><button type="button" disabled={pickerPage===1} onClick={()=>setPickerPage(pickerPage-1)}>Previous products</button>
                  <button type="button" disabled={pickerPage>=pickerPages} onClick={()=>setPickerPage(pickerPage+1)}>More products</button></div>}

              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
                  className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/20"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 100'}
                  min="0"
                  max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                  step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                  className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-dark">
                  Active
                </label>
              </div>
            </div>

            {products.some(p=>p.id===Number(formData.productId)) && Number(formData.value)>0 && <p className="my-3 text-sm">Preview price per pack · ₹{effectiveUnitPrice((products.find(p=>p.id===Number(formData.productId)) as Product).price,[{type:formData.type,value:Number(formData.value)}]).toLocaleString("en-IN")}</p>}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-forest text-white px-6 py-2 rounded-md hover:bg-dark-dark transition-colors"
              >
                {editingDiscount ? 'Update Discount' : 'Create Discount'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingDiscount(null);
                  resetForm();
                }}
                className="bg-gray-3 text-dark px-6 py-2 rounded-md hover:bg-gray-4 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts List */}
      <div className="bg-white rounded-[10px] shadow-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-3">
          <h2 className="text-lg font-semibold text-dark">Product discounts ({discounts.length})</h2>
        </div>
        
        {discounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🏷️</div>
            <p className="text-gray-6 mb-4">No discounts created yet</p>
            <button
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
              className="bg-forest text-white px-4 py-2 rounded-md hover:bg-dark-dark transition-colors"
            >
              Create First Discount
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark">Original Price</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark">Final Price</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark">Valid Until</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-1">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-dark">{discount.product.title}</div>
                        <div className="text-sm text-gray-6">ID: {discount.product.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark">₹{discount.product.price}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `₹${discount.value}`} OFF
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-dark">
                        ₹{effectiveUnitPrice(discount.product.price,[discount])}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        promotionState(discount) === 'Live' ? 'bg-green-100 text-green-800' : promotionState(discount) === 'Scheduled' ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {promotionState(discount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-6">
                      {discount.endDate 
                        ? new Date(discount.endDate).toLocaleDateString() 
                        : 'No expiry'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-blue hover:text-blue-dark text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="text-red hover:text-red-dark text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
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

export default function ProtectedDiscountsPage() {
  return <><DiscountsPage /></>;
}
