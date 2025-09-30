"use client";
import React, { useState, useEffect } from 'react';
import { generateSlug } from "@/lib/utils";

type NewsEditorProps = {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    published: boolean;
    img?: string;
    metaTitle?: string;
    metaDescription?: string;
    tags?: { id: number; name: string; slug: string }[];
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel: () => void;
};

const NewsEditor: React.FC<NewsEditorProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false,
    img: '',
    metaTitle: '',
    metaDescription: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [allTags, setAllTags] = useState<{id: number, name: string, slug: string}[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        published: initialData.published || false,
        img: initialData.img || '',
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
      });
      
      // Determine the initial image source type based on the existing image
      if (initialData.img) {
        if (initialData.img.startsWith('http://') || initialData.img.startsWith('https://')) {
          setImageSourceType('url');
        } else {
          setImageSourceType('upload');
        }
      }
      if (initialData.tags) {
        setSelectedTags(initialData.tags.map((t: any) => t.id));
      }
    }
  }, [initialData]);

  useEffect(() => {
    // Fetch all tags for selection
    fetch('/api/admin/tags')
      .then(res => res.json())
      .then(data => setAllTags(data.tags || []));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.tag-dropdown-container')) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'title') {
      // Auto-generate slug from title if slug is empty or matches the previous title
      const currentTitle = formData.title;
      if (!formData.slug || formData.slug === generateSlug(currentTitle)) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          slug: generateSlug(value)
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, img: data.url }));
      setImageError(false);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({
      ...formData,
      tagIds: selectedTags
    });
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;
    
    setIsCreatingTag(true);
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          slug: generateSlug(newTagName.trim())
        })
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setAllTags(prev => [...prev, newTag]);
        setSelectedTags(prev => [...prev, newTag.id]);
        setNewTagName('');
        setTagSearch('');
        setShowTagDropdown(false);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const filteredTags = allTags.filter(tag => 
    tag && typeof tag.name === 'string' && tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter news article title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="url-friendly-slug"
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the news article"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Write your news article content here..."
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          </div>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            
            {/* Image Source Type Toggle */}
            <div className="flex mb-3">
              <button
                type="button"
                onClick={() => setImageSourceType('upload')}
                className={`px-3 py-1 text-sm rounded-l-md border ${
                  imageSourceType === 'upload'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageSourceType('url')}
                className={`px-3 py-1 text-sm rounded-r-md border ${
                  imageSourceType === 'url'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                URL
              </button>
            </div>

            {imageSourceType === 'upload' ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                {formData.img ? (
                  <div className="space-y-3">
                    <img
                      src={formData.img}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-600">Image uploaded successfully</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Drag and drop an image here, or</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Choose File
                    </label>
                  </div>
                )}
                
                {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
                {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={formData.img}
                  onChange={handleInputChange}
                  name="img"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.img && (
                  <div className="mt-3">
                    <img
                      src={formData.img}
                      alt="Preview"
                      className="h-32 w-full object-cover rounded-lg"
                      onLoad={() => setImageError(false)}
                      onError={() => setImageError(true)}
                    />
                    {imageError && (
                      <p className="mt-1 text-sm text-red-600">Failed to load image</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="tag-dropdown-container relative">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tagId => {
                  const tag = allTags.find(t => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => toggleTag(tagId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => {
                    setTagSearch(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search or add tags..."
                />
                
                {showTagDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          toggleTag(tag.id);
                          setTagSearch('');
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                          selectedTags.includes(tag.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                    
                    {tagSearch && !filteredTags.some(tag => tag.name.toLowerCase() === tagSearch.toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewTagName(tagSearch);
                          createNewTag();
                          setShowTagDropdown(false);
                        }}
                        disabled={isCreatingTag}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-blue-600"
                      >
                        {isCreatingTag ? 'Creating...' : `Create "${tagSearch}"`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Publish immediately
            </label>
          </div>

          {/* Meta Title */}
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO title"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO description"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
        >
          {isSubmitting ? 'Saving...' : 'Save News Article'}
        </button>
      </div>
    </form>
  );
};

export default NewsEditor;
