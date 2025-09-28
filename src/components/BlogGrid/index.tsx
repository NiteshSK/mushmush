"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const BlogGrid = () => {
  // --- STATE MANAGEMENT FOR PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6; // You can change this number

  // --- FETCH DYNAMIC BLOG DATA ---
  const { data, loading, error } = useBlogPosts(currentPage, blogsPerPage, true);

  // --- PAGINATION LOGIC ---
  const totalPages = data?.pagination?.totalPages || 1;

  // --- HANDLER FUNCTIONS ---
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  // Generate page numbers for the pagination control
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumb title={"Blog"} pages={["blog"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="text-xl">Loading blog posts...</div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Breadcrumb title={"Blog"} pages={["blog"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="text-xl text-red-500">Error loading blog posts</div>
              <div className="text-sm mt-2">{error}</div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Blog"} pages={["blog"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* --- BLOG HEADER --- */}
          <div className="text-center mb-10">
            <h1 className="font-bold text-dark text-3xl sm:text-4xl xl:text-[45px] xl:leading-[55px] mb-4">
              Latest Blog Posts
            </h1>
            <p className="text-base text-gray-6 max-w-[600px] mx-auto">
              Discover our latest articles about mushroom cultivation, recipes, and expert tips
            </p>
          </div>

          {/* --- BLOG GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7.5">
            {/* --- DISPLAY CURRENT PAGE'S BLOGS --- */}
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

          {/* --- PAGINATION --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === 1
                    ? "bg-gray-3 text-gray-5 cursor-not-allowed"
                    : "bg-white text-dark hover:bg-blue hover:text-white border border-gray-3"
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    currentPage === number
                      ? "bg-blue text-white"
                      : "bg-white text-dark hover:bg-blue hover:text-white border border-gray-3"
                  }`}
                >
                  {number}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-3 text-gray-5 cursor-not-allowed"
                    : "bg-white text-dark hover:bg-blue hover:text-white border border-gray-3"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogGrid;