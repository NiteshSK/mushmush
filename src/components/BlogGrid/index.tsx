"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const BlogGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  const { data, loading, error } = useBlogPosts(currentPage, blogsPerPage, true);

  const totalPages = data?.pagination?.totalPages || 1;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Blog"} pages={["Blog"]} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title={"Blog"} pages={["Blog"]} />
        <div className="text-center py-20">
          <p className="text-sm text-red-600">Error loading blog posts</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Blog"} pages={["Blog"]} />

      <section className="py-12 sm:py-16 bg-forest/5">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Journal</span>
            <h2 className="font-medium text-2xl sm:text-3xl text-dark mb-4">
              Latest from the Farm
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Cultivation tips, recipes, and stories from the world of mushrooms.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.posts?.map((blog) => (
              <BlogItem
                key={blog.id}
                blog={{
                  date: formatDate(blog.createdAt),
                  views: blog.views,
                  title: blog.title,
                  img:
                    typeof blog.img === "string" && blog.img.trim()
                      ? blog.img
                      : "/images/blog/oyster-blog-01.png"
                }}
                slug={blog.slug}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-dark hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                      currentPage === number
                        ? "bg-dark text-white"
                        : "text-gray-500 hover:text-dark hover:bg-gray-100"
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-dark hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogGrid;
