"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NewsEditor from '@/components/Admin/NewsEditor';

type NewsArticle = {
  id: number;
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

const EditNewsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState<NewsArticle | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchNews();
    }
  }, [params.id]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/admin/news/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setNewsData(data);
      } else if (response.status === 401) {
        alert('You need to be logged in as an admin to edit news articles');
        router.push('/auth/signin');
      } else if (response.status === 404) {
        alert('News article not found');
        router.push('/admin/news');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to load news article');
        router.push('/admin/news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      alert('Failed to load news article');
      router.push('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/news');
      } else if (response.status === 401) {
        alert('You need to be logged in as an admin to update news articles');
        router.push('/auth/signin');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update news article');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Failed to update news article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/news');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading news article...</div>
        </div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">News Article Not Found</h1>
          <button
            onClick={() => router.push('/admin/news')}
            className="bg-forest text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-dark transition-colors"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit News Article</h1>
        <p className="mt-2 text-gray-600">Update your news article</p>
      </div>

      <div className="bg-white rounded-[10px] shadow-1 border p-6">
        <NewsEditor
          initialData={newsData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditNewsPage;
