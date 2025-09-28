"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type NewsArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  views: number;
  createdAt: string;
  img?: string;
};

const NewsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "views">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = news;

    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(article => 
        statusFilter === "published" ? article.published : !article.published
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [news, query, statusFilter, sortBy, sortOrder]);

  const deleteNews = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNews(news.filter(article => article.id !== id));
      } else {
        alert('Failed to delete news article');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Failed to delete news article');
    }
  };

  const togglePublished = async (id: number, currentStatus: boolean) => {
    try {
      const article = news.find(n => n.id === id);
      if (!article) return;

      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...article,
          published: !currentStatus
        }),
      });

      if (response.ok) {
        setNews(news.map(article => 
          article.id === id 
            ? { ...article, published: !currentStatus }
            : article
        ));
      } else {
        alert('Failed to update news article status');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Failed to update news article status');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading news...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
        <Link
          href="/admin/news/create"
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
        >
          Create New Article
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news articles..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "createdAt" | "title" | "views")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {query || statusFilter !== "all" 
              ? "No news articles match your filters." 
              : "No news articles found. Create your first article!"
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSorted.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {article.img && (
                          <div className="flex-shrink-0 h-12 w-12 mr-4">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={article.img}
                              alt={article.title}
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {article.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          article.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/news/${article.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => togglePublished(article.id, article.published)}
                          className={`${
                            article.published 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {article.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => deleteNews(article.id)}
                          className="text-red-600 hover:text-red-900"
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

export default NewsPage;
