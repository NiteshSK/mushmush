"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NewsEditor from '@/components/Admin/NewsEditor';

const CreateNewsPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/news');
      } else if (response.status === 401) {
        alert('You need to be logged in as an admin to create news articles');
        router.push('/auth/signin');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create news article');
      }
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Failed to create news article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/news');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create News Article</h1>
        <p className="mt-2 text-gray-600">Write and publish a new news article</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <NewsEditor
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateNewsPage;
