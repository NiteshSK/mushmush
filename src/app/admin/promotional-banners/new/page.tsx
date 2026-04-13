"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthWrapper from '@/components/Admin/AdminAuthWrapper';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  inStock: boolean;
}

interface Category {
  id: number;
  title: string;
  slug: string;
}

const CreateBannerContent: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    discount: '',
    buttonText: 'Buy Now',
    buttonLink: '',
    productId: '',
    categoryId: '',
    imageUrl: '',
    bgColor: '#F5F5F7',
    textColor: '#000000',
    isActive: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
    priority: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.imageUrl) {
      toast.error('Title and image URL are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/promotional-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          productId: formData.productId || null,
          categoryId: formData.categoryId || null,
          endDate: formData.endDate || null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Promotional banner created successfully!');
        router.push('/admin/promotional-banners');
      } else {
        toast.error(data.error || 'Failed to create banner');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error('Failed to create banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/promotional-banners"
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-dark">Create Promotional Banner</h1>
            <p className="text-gray-600 mt-1">Create a new promotional banner for your website</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-lg font-medium text-dark mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="Enter banner title"
                required
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="Enter banner subtitle"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="Enter banner description"
              />
            </div>

            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                Discount Text
              </label>
              <input
                type="text"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="e.g., UP TO 50% OFF"
              />
            </div>

            <div>
              <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                id="buttonText"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="Button text"
              />
            </div>
          </div>
        </div>

        {/* Link Configuration */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-lg font-medium text-dark mb-4">Link Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
                Link to Product
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.title} - ${product.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Link to Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Link
              </label>
              <input
                type="text"
                id="buttonLink"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="/shop-details or https://example.com"
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Choose one option: link to a specific product, category, or provide a custom URL. Product/category links take priority over custom links.
          </p>
        </div>

        {/* Visual Configuration */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-lg font-medium text-dark mb-4">Visual Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="/images/promo/banner-image.png"
                required
              />
            </div>

            <div>
              <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="bgColor"
                  name="bgColor"
                  value={formData.bgColor}
                  onChange={handleInputChange}
                  className="w-12 h-10 border border-gray-3 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.bgColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                  placeholder="#F5F5F7"
                />
              </div>
            </div>

            <div>
              <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="textColor"
                  name="textColor"
                  value={formData.textColor}
                  onChange={handleInputChange}
                  className="w-12 h-10 border border-gray-3 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Settings */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-lg font-medium text-dark mb-4">Schedule & Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="0"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Higher numbers appear first</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-3 text-forest focus:ring-forest"
              />
              <span className="ml-2 text-sm text-gray-700">Active (banner will be displayed)</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {formData.title && formData.imageUrl && (
          <div className="bg-white rounded-[10px] shadow-1 p-6">
            <h2 className="text-lg font-medium text-dark mb-4">Preview</h2>
            <div 
              className="relative overflow-hidden rounded-lg py-12 px-8 max-w-2xl"
              style={{ 
                backgroundColor: formData.bgColor,
                color: formData.textColor 
              }}
            >
              <div className="max-w-md">
                {formData.subtitle && (
                  <span className="block font-medium text-lg mb-2">
                    {formData.subtitle}
                  </span>
                )}
                <h3 className="font-bold text-2xl mb-3">
                  {formData.discount || formData.title}
                </h3>
                {formData.description && (
                  <p className="mb-4 opacity-90">
                    {formData.description}
                  </p>
                )}
                <div className="inline-flex font-medium text-sm text-white bg-forest py-2.5 px-6 rounded-md">
                  {formData.buttonText}
                </div>
              </div>
              <img
                src={formData.imageUrl}
                alt={formData.title}
                className="absolute top-1/2 -translate-y-1/2 right-4 w-32 h-40 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/promotional-banners"
            className="px-6 py-2 border border-gray-3 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-forest text-white rounded-md hover:bg-dark-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Create Banner
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function CreateBannerPage() {
  return (
    <AdminAuthWrapper>
      <CreateBannerContent />
    </AdminAuthWrapper>
  );
}
