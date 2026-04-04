"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminAuthWrapper from '@/components/Admin/AdminAuthWrapper';

interface Coupon {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  maxUses: number | null;
  maxUsesPerEmail: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count: { usages: number };
}

const CouponForm = ({ onCreated }: { onCreated: () => void }) => {
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    maxUses: '',
    maxUsesPerEmail: '1',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value || !form.endDate) {
      toast.error('Code, value, and end date are required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Coupon ${data.coupon.code} created!`);
        setForm({
          code: '', type: 'PERCENTAGE', value: '', minOrderValue: '',
          maxDiscount: '', maxUses: '', maxUsesPerEmail: '1',
          startDate: new Date().toISOString().slice(0, 16), endDate: '',
        });
        onCreated();
      } else {
        toast.error(data.error || 'Failed to create coupon');
      }
    } catch {
      toast.error('Error creating coupon');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-1 p-6">
      <h3 className="text-lg font-semibold text-dark mb-4">Create New Coupon</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">Code</label>
          <input
            type="text"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. WELCOME20"
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue font-mono uppercase"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">Type</label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">
            Value {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}
          </label>
          <input
            type="number"
            value={form.value}
            onChange={e => setForm({ ...form, value: e.target.value })}
            placeholder={form.type === 'PERCENTAGE' ? '20' : '100'}
            min="0"
            step={form.type === 'PERCENTAGE' ? '1' : '0.01'}
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">Min Order Value (optional)</label>
          <input
            type="number"
            value={form.minOrderValue}
            onChange={e => setForm({ ...form, minOrderValue: e.target.value })}
            placeholder="e.g. 500"
            min="0"
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">Max Discount Cap (optional)</label>
          <input
            type="number"
            value={form.maxDiscount}
            onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
            placeholder="e.g. 200"
            min="0"
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">Max Total Uses (optional)</label>
          <input
            type="number"
            value={form.maxUses}
            onChange={e => setForm({ ...form, maxUses: e.target.value })}
            placeholder="Unlimited"
            min="1"
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">Max Uses Per Email</label>
          <input
            type="number"
            value={form.maxUsesPerEmail}
            onChange={e => setForm({ ...form, maxUsesPerEmail: e.target.value })}
            min="1"
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={e => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-6 mb-1">End Date</label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={e => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-blue text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
};

const CouponsPageContent = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const toggleActive = async (id: number, currentActive: boolean) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentActive } : c));
        toast.success(`Coupon ${!currentActive ? 'activated' : 'deactivated'}`);
      }
    } catch {
      toast.error('Failed to update coupon');
    } finally {
      setToggling(null);
    }
  };

  const deleteCoupon = async (id: number, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        toast.success('Coupon deleted');
      }
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-2">Coupon Management</h1>
        <p className="text-gray-6">Create and manage discount coupons for your customers.</p>
      </div>

      <CouponForm onCreated={fetchCoupons} />

      <div className="bg-white rounded-lg shadow-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-3">
          <h3 className="text-lg font-semibold text-dark">All Coupons</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-5">No coupons created yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-6 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-6 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-6 uppercase">Limits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-6 uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-6 uppercase">Validity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-6 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-6 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-gray-1">
                    <td className="px-4 py-4">
                      <span className="font-mono font-semibold text-dark bg-gray-1 px-2 py-1 rounded text-sm">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="text-dark font-medium">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </div>
                      {coupon.maxDiscount && (
                        <div className="text-xs text-gray-5">Max ₹{coupon.maxDiscount}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-6">
                      {coupon.minOrderValue ? <div>Min order: ₹{coupon.minOrderValue}</div> : null}
                      <div>{coupon.maxUsesPerEmail}x per email</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`font-medium ${coupon.maxUses && coupon.usedCount >= coupon.maxUses ? 'text-red' : 'text-dark'}`}>
                        {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''} used
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-6">
                      <div>{new Date(coupon.startDate).toLocaleDateString()}</div>
                      <div>to {new Date(coupon.endDate).toLocaleDateString()}</div>
                      {isExpired(coupon.endDate) && (
                        <span className="text-red font-medium">Expired</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        !coupon.isActive ? 'bg-gray-2 text-gray-6' :
                        isExpired(coupon.endDate) ? 'bg-red-light-5 text-red' :
                        'bg-green-light-5 text-green'
                      }`}>
                        {!coupon.isActive ? 'Inactive' : isExpired(coupon.endDate) ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(coupon.id, coupon.isActive)}
                          disabled={toggling === coupon.id}
                          className={`px-3 py-1 text-xs rounded-md font-medium ${
                            coupon.isActive
                              ? 'bg-red-light-6 text-red hover:bg-red-light-5'
                              : 'bg-green-light-6 text-green hover:bg-green-light-5'
                          } disabled:opacity-50`}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id, coupon.code)}
                          className="px-3 py-1 text-xs rounded-md font-medium bg-gray-2 text-gray-6 hover:bg-red-light-6 hover:text-red"
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

export default function CouponsPage() {
  return (
    <AdminAuthWrapper>
      <CouponsPageContent />
    </AdminAuthWrapper>
  );
}
