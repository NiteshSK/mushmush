"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from '@/components/Admin/BlogEditor';

const NewBlogPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (blogData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/admin/blogs');
      } else {
        const error = await response.json();
        alert('Error creating blog post: ' + error.message);
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Error creating blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-1">Create New Blog Post</h1>
        <p className="text-gray-6">Write and publish a new blog post with rich content and images.</p>
      </div>

      <BlogEditor
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => router.push('/admin/blogs')}
      />
    </div>
  );
};

export default NewBlogPage;
