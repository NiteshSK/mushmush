"use client";
import React, { useState, useEffect } from 'react';

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
    }
  }, [initialData]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
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

    setUploading(true);
    setUploadError('');

    try {
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
      } else {
        const error = await response.json();
        setUploadError(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image');
    } finally {
      setUploading(false);
    }
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
            <label htmlFor="img" className="block text-sm font-medium text-gray-7 mb-2">
              Featured Image
            </label>
            
            {/* Image Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
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
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </label>
                <span className="text-sm text-gray-6">
                  or enter URL below
                </span>
              </div>

              {uploadError && (
                <p className="text-sm text-red">{uploadError}</p>
              )}

              {formData.img && (
                <div className="mt-3">
                  <img
                    src={formData.img}
                    alt="Featured image preview"
                    className="w-32 h-32 object-cover rounded-md border border-gray-3"
                  />
                  <p className="mt-1 text-sm text-gray-6">
                    Current image: {formData.img}
                  </p>
                </div>
              )}

              <input
                type="url"
                id="img"
                value={formData.img}
                onChange={(e) => setFormData(prev => ({ ...prev, img: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                placeholder="https://example.com/image.jpg"
              />
            </div>
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
            <p>💡 Tip: Use the buttons above to insert HTML elements, or write your own HTML. The content will be rendered with proper styling.</p>
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
