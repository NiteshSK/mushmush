"use client";
import React, { useState, useEffect } from 'react';
import { generateSlug } from "@/lib/utils";

type BlogEditorProps = {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    published: boolean;
    img?: string;
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel: () => void;
};

const BlogEditor: React.FC<BlogEditorProps> = ({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        published: initialData.published || false,
        img: initialData.img || '',
      });
      
      // Determine the initial image source type based on the existing image
      if (initialData.img) {
        if (initialData.img.startsWith('http://') || initialData.img.startsWith('https://')) {
          setImageSourceType('url');
        } else {
          setImageSourceType('upload');
        }
      }
    }
  }, [initialData]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const validateImageUrl = (url: string): { isValid: boolean; error: string } => {
    if (!url.trim()) {
      return { isValid: true, error: '' }; // Empty URLs are valid (optional field)
    }
    
    try {
      const urlObj = new URL(url);
      // Check if it's a valid HTTP/HTTPS URL
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }
      
      // Check if it's an image URL by extension
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        url.toLowerCase().includes(ext)
      );
      
      if (!hasImageExtension) {
        return { isValid: false, error: 'URL must point to an image file (jpg, png, webp, gif, or svg)' };
      }
      
      return { isValid: true, error: '' };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    // Enhanced image validation
    if (imageSourceType === 'url' && formData.img.trim()) {
      const { isValid, error } = validateImageUrl(formData.img);
      if (!isValid) {
        newErrors.img = error;
      }
    }

    // Clear previous image error when switching to upload or removing image
    if (imageSourceType === 'upload' || !formData.img.trim()) {
      delete newErrors.img;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const insertHtml = (html: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      setFormData(prev => ({
        ...prev,
        content: before + html + after,
      }));
      
      // Set cursor position after inserted HTML
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + html.length, start + html.length);
      }, 0);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processImageUpload(file);
  };

  const processImageUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');
    setImageError(false);

    try {
      // Client-side validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadError('File too large. Maximum size is 5MB.');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/blogs/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          img: data.url,
        }));
        setImageSourceType('upload');
        setImageLoading(true);
      } else {
        const error = await response.json();
        setUploadError(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImageUpload(file);
      } else {
        setUploadError('Please drop an image file');
      }
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      img: url,
    }));
  };

  const getImageDisplayUrl = (imgPath: string) => {
    if (!imgPath) return null;
    
    // If it's already a full URL, return as is
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    
    // If it's a local path, ensure it starts with /
    return imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      img: '',
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-1">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="p-6 border-b border-gray-3">
          <h2 className="text-lg font-semibold text-dark mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-7 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue ${
                  errors.title ? 'border-red' : 'border-gray-3'
                }`}
                placeholder="Enter blog post title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-7 mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue ${
                  errors.slug ? 'border-red' : 'border-gray-3'
                }`}
                placeholder="blog-post-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red">{errors.slug}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-7 mb-2">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue ${
                errors.excerpt ? 'border-red' : 'border-gray-3'
              }`}
              placeholder="Brief description of the blog post"
            />
            {errors.excerpt && (
              <p className="mt-1 text-sm text-red">{errors.excerpt}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-7 mb-2">
              Featured Image
            </label>
            
            {/* Image Source Selection */}
            <div className="mb-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="imageSource"
                    value="upload"
                    checked={imageSourceType === 'upload'}
                    onChange={() => setImageSourceType('upload')}
                    className="mr-2"
                  />
                  <span className="text-sm">Upload Image</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="imageSource"
                    value="url"
                    checked={imageSourceType === 'url'}
                    onChange={() => setImageSourceType('url')}
                    className="mr-2"
                  />
                  <span className="text-sm">External URL</span>
                </label>
              </div>
            </div>

            {/* Image Upload Section */}
            {imageSourceType === 'upload' && (
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-3 border-2 border-dashed rounded-md p-4 ${isDragOver ? 'border-blue' : 'border-gray-3'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`px-4 py-2 rounded-md cursor-pointer ${
                      uploading
                        ? 'bg-gray-3 text-gray-6 cursor-not-allowed'
                        : 'bg-blue text-white hover:bg-blue/90'
                    }`}
                  >
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </label>
                  <span className="text-sm text-gray-6">
                    Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
                  </span>
                  {isDragOver && (
                    <p className="text-sm text-blue">Drop the image here</p>
                  )}
                </div>

                {uploadError && (
                  <p className="text-sm text-red">{uploadError}</p>
                )}

                {/* Local path display for uploaded images */}
                {formData.img && imageSourceType === 'upload' && (
                  <div className="mt-3 p-3 bg-gray-1 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-7">Uploaded Image Path:</p>
                        <code className="text-xs bg-gray-2 px-2 py-1 rounded">{formData.img}</code>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-red hover:text-red/80 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* URL Input Section */}
            {imageSourceType === 'url' && (
              <div className="space-y-3">
                <input
                  type="url"
                  id="img-url"
                  value={formData.img}
                  onChange={handleImageUrlChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue ${
                    errors.img ? 'border-red' : 'border-gray-3'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.img && (
                  <p className="text-sm text-red">{errors.img}</p>
                )}
                <p className="text-xs text-gray-6">
                  Enter a full URL including http:// or https://
                </p>
              </div>
            )}

            {/* Image Preview */}
            {formData.img && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-7 mb-2">Preview:</p>
                <div className="border border-gray-3 rounded-md p-3 inline-block">
                  {imageLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 w-48 bg-gray-1 rounded">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mb-2"></div>
                      <p className="text-sm text-gray-6">Loading image...</p>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={getImageDisplayUrl(formData.img)}
                        alt="Featured image preview"
                        className="max-w-xs max-h-48 object-contain rounded transition-opacity duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/images/blog/blog-small-01.jpg';
                          e.currentTarget.alt = 'Image failed to load';
                          setImageError(true);
                          setImageLoading(false);
                        }}
                        onLoad={() => {
                          setImageLoading(false);
                          setImageError(false);
                        }}
                        loading="lazy"
                      />
                      {imageError && (
                        <div className="absolute inset-0 bg-red/10 rounded flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-red text-sm font-medium">Image failed to load</p>
                            <p className="text-red/70 text-xs">Using placeholder</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-6">
                    <span className="font-medium">Source:</span> {imageSourceType === 'upload' ? 'Local upload' : 'External URL'}
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-xs text-red hover:text-red/80 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div className="p-6 border-b border-gray-3">
          <h2 className="text-lg font-semibold text-dark mb-4">Content</h2>
          
          {/* HTML Insertion Tools */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => insertHtml('<h3>Heading</h3>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              H3 Heading
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<p>Paragraph text</p>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Paragraph
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<ul><li>List item</li></ul>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Bullet List
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<ol><li>List item</li></ol>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Numbered List
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<blockquote>Quote text</blockquote>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Quote
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<strong>Bold text</strong>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Bold
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<em>Italic text</em>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Italic
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<a href="https://example.com">Link text</a>')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<img src="/images/blog/your-image.jpg" alt="Description" />')}
              className="px-3 py-1 text-sm bg-gray-2 hover:bg-gray-3 rounded-md"
            >
              Image
            </button>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-7 mb-2">
              Content (HTML) *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={15}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue font-mono text-sm ${
                errors.content ? 'border-red' : 'border-gray-3'
              }`}
              placeholder="Write your blog content in HTML format..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red">{errors.content}</p>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-6">
            <p> Tip: Use the buttons above to insert HTML elements, or write your own HTML. The content will be rendered with proper styling.</p>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Publishing Options</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 text-blue focus:ring-blue border-gray-3 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-7">
              Publish this blog post
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-7 hover:text-dark"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue text-white rounded-md hover:bg-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Blog Post' : 'Create Blog Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
