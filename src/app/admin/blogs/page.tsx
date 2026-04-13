"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  views: number;
  createdAt: string;
  img?: string;
};

const BlogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "views">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = blogs;

    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(query.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter === "published") {
      filtered = filtered.filter(blog => blog.published);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter(blog => !blog.published);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "views":
          comparison = a.views - b.views;
          break;
        case "createdAt":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [blogs, query, statusFilter, sortBy, sortOrder]);

  const togglePublish = async (id: number, published: boolean) => {
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !published }),
      });

      if (response.ok) {
        await fetchBlogs(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const deleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBlogs(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const publishedCount = blogs.filter(blog => blog.published).length;
  const draftCount = blogs.filter(blog => !blog.published).length;
  const totalViews = blogs.reduce((sum, blog) => sum + blog.views, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] shadow-1 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-dark mb-1">Blog Management</h1>
          <p className="text-gray-6">Create, edit and manage blog posts, content and images.</p>
        </div>
        <Link href="/admin/blogs/new" className="inline-flex items-center px-4 py-2 rounded-md bg-forest text-white">
          + New Blog Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[10px] shadow-1 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-6">Total Posts</p>
              <p className="text-2xl font-semibold text-dark">{blogs.length}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] shadow-1 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-6">Published</p>
              <p className="text-2xl font-semibold text-green-600">{publishedCount}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] shadow-1 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-6">Total Views</p>
              <p className="text-2xl font-semibold text-blue-600">{totalViews.toLocaleString()}</p>
            </div>
            <div className="text-3xl">👁️</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[10px] shadow-1 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search by title or excerpt..." 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="all">All Status</option>
              <option value="published">Published ({publishedCount})</option>
              <option value="draft">Draft ({draftCount})</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "createdAt" | "title" | "views")}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="views">Sort by Views</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border rounded-md hover:bg-gray-1"
            >
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white rounded-[10px] shadow-1">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-3">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-6">Title</th>
                  <th className="text-left p-4 font-medium text-gray-6">Slug</th>
                  <th className="text-left p-4 font-medium text-gray-6">Status</th>
                  <th className="text-left p-4 font-medium text-gray-6">Views</th>
                  <th className="text-left p-4 font-medium text-gray-6">Created</th>
                  <th className="text-left p-4 font-medium text-gray-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-3 hover:bg-gray-1">
                    <td className="p-4">
                      <div className="font-medium text-dark">{blog.title}</div>
                      <div className="text-sm text-gray-6 truncate max-w-xs">{blog.excerpt}</div>
                      {blog.img && (
                        <div className="mt-1">
                          <img 
                            src={blog.img} 
                            alt={blog.title}
                            className="w-12 h-12 object-cover rounded border border-gray-3"
                          />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-gray-2 px-2 py-1 rounded">{blog.slug}</code>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublish(blog.id, blog.published)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          blog.published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {blog.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-4 text-gray-6">
                      <span className="font-medium">{blog.views.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-gray-6">
                      <div className="text-sm">
                        {new Date(blog.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-5">
                          {new Date(blog.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/blogs/${blog.id}`}
                          className="text-blue hover:text-blue/80 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteBlog(blog.id)}
                          className="text-red hover:text-red/80 text-sm font-medium"
                        >
                          Delete
                        </button>
                        <Link
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-6 hover:text-dark text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAndSorted.length === 0 && (
              <div className="p-12 text-center text-gray-6">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-7 mb-2">No blog posts found</h3>
                <p className="text-sm">
                  {query || statusFilter !== "all" 
                    ? "Try adjusting your search or filters."
                    : "Get started by creating your first blog post."
                  }
                </p>
                {(!query && statusFilter === "all") && (
                  <Link
                    href="/admin/blogs/new"
                    className="inline-block mt-4 px-4 py-2 bg-forest text-white rounded-md hover:bg-dark/90 text-sm"
                  >
                    Create Blog Post
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
