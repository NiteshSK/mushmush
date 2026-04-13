"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BlogEditor from '@/components/Admin/BlogEditor';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  img?: string;
};

const EditBlogPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`);
      if (response.ok) {
        const data = await response.json();
        setBlog(data.blog);
      } else {
        router.push('/admin/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      router.push('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (blogData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'PUT',
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
        alert('Error updating blog post: ' + error.message);
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert('Error updating blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h1 className="text-2xl font-semibold text-dark mb-1">Edit Blog Post</h1>
        </div>
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          Loading...
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h1 className="text-2xl font-semibold text-dark mb-1">Blog Post Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-1">Edit Blog Post</h1>
        <p className="text-gray-6">Update your blog post content and settings.</p>
      </div>

      <BlogEditor
        initialData={blog}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => router.push('/admin/blogs')}
      />
    </div>
  );
};

export default EditBlogPage;
