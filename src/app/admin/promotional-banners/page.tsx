"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminAuthWrapper from '@/components/Admin/AdminAuthWrapper';
import { PromotionalBanner } from '@/types/promotional-banner';
import { Edit, Trash2, Plus, Eye, EyeOff, Calendar, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface BannerResponse {
  success: boolean;
  data: PromotionalBanner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

const PromotionalBannersContent: React.FC = () => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const router = useRouter();

  useEffect(() => {
    fetchBanners();
  }, [currentPage, statusFilter]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/promotional-banners?${params}`);
      const data: BannerResponse = await response.json();
      
      if (data.success) {
        setBanners(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error(data.error || 'Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) {
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/promotional-banners/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error(data.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    } finally {
      setDeleting(null);
    }
  };

  const toggleBannerStatus = async (banner: PromotionalBanner) => {
    try {
      const response = await fetch(`/api/admin/promotional-banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...banner,
          isActive: !banner.isActive
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchBanners();
      } else {
        toast.error(data.error || 'Failed to update banner status');
      }
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBannerStatus = (banner: PromotionalBanner) => {
    if (!banner.isActive) return { status: 'Inactive', color: 'bg-gray-100 text-gray-600' };
    
    const now = new Date();
    const startDate = new Date(banner.startDate);
    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    
    if (startDate > now) return { status: 'Scheduled', color: 'bg-blue-100 text-blue-600' };
    if (endDate && endDate < now) return { status: 'Expired', color: 'bg-red-100 text-red-600' };
    return { status: 'Active', color: 'bg-green-100 text-green-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600">Loading promotional banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Promotional Banners</h1>
          <p className="text-gray-600 mt-1">Manage promotional banners displayed on your website</p>
        </div>
        <Link
          href="/admin/promotional-banners/new"
          className="inline-flex items-center px-4 py-2 bg-forest text-white rounded-md hover:bg-dark-dark transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Banner
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[10px] shadow-1 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="border border-gray-3 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
          >
            <option value="all">All Banners</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-[10px] shadow-1 overflow-hidden">
        {banners.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No promotional banners found</h3>
            <p className="text-gray-500 mb-4">Create your first promotional banner to get started.</p>
            <Link
              href="/admin/promotional-banners/new"
              className="inline-flex items-center px-4 py-2 bg-forest text-white rounded-md hover:bg-dark-dark transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Create Banner
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked To
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => {
                  const status = getBannerStatus(banner);
                  return (
                    <tr key={banner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={banner.imageUrl}
                              alt={banner.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {banner.title}
                            </div>
                            {banner.subtitle && (
                              <div className="text-sm text-gray-500">
                                {banner.subtitle}
                              </div>
                            )}
                            {banner.discount && (
                              <div className="text-xs text-blue-600 font-medium">
                                {banner.discount}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          {status.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Target size={16} className="mr-1 text-gray-400" />
                          {banner.priority}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1 text-gray-400" />
                          <div>
                            <div>Start: {formatDate(banner.startDate)}</div>
                            {banner.endDate && (
                              <div>End: {formatDate(banner.endDate)}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.product && (
                          <div className="text-blue-600">Product: {banner.product.title}</div>
                        )}
                        {banner.category && (
                          <div className="text-green-600">Category: {banner.category.title}</div>
                        )}
                        {banner.buttonLink && !banner.product && !banner.category && (
                          <div className="text-purple-600">Custom Link</div>
                        )}
                        {!banner.product && !banner.category && !banner.buttonLink && (
                          <div className="text-gray-400">No link</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleBannerStatus(banner)}
                            className={`p-2 rounded-md transition-colors ${
                              banner.isActive 
                                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
                            }`}
                            title={banner.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {banner.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <Link
                            href={`/admin/promotional-banners/${banner.id}/edit`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-dark-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            disabled={deleting === banner.id}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === banner.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-[10px] shadow-1 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-3 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-3 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PromotionalBannersPage() {
  return (
    <AdminAuthWrapper>
      <PromotionalBannersContent />
    </AdminAuthWrapper>
  );
}
