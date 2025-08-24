"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import blogData from "./blogData";
import BlogItem from "../Blog/BlogItem";

const BlogGrid = () => {
  // --- STATE MANAGEMENT FOR PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6; // You can change this number

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(blogData.length / blogsPerPage);

  // Get current blogs to display
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogData.slice(indexOfFirstBlog, indexOfLastBlog);

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

  return (
    <>
      <Breadcrumb title={"Blog Grid"} pages={["blog grid"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
            {/* --- DISPLAY CURRENT PAGE'S BLOGS --- */}
            {currentBlogs.map((blog, key) => (
              <BlogItem blog={blog} key={key} />
            ))}
          </div>

          {/* --- DYNAMIC BLOG PAGINATION START --- */}
          <div className="flex justify-center mt-15">
            <div className="bg-white shadow-1 rounded-md p-2">
              <ul className="flex items-center">
                {/* Previous Button */}
                <li>
                  <button
                    aria-label="button for pagination left"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:bg-blue hover:text-white disabled:text-gray-4 disabled:bg-transparent disabled:cursor-not-allowed"
                  >
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z" />
                    </svg>
                  </button>
                </li>

                {/* Page Numbers */}
                {pageNumbers.map((number) => (
                  <li key={number}>
                    <button
                      onClick={() => handlePageChange(number)}
                      className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue ${
                        currentPage === number
                          ? "bg-blue text-white"
                          : "text-dark"
                      }`}
                    >
                      {number}
                    </button>
                  </li>
                ))}

                {/* Next Button */}
                <li>
                  <button
                    aria-label="button for pagination right"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:bg-transparent disabled:cursor-not-allowed"
                  >
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z" />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* --- DYNAMIC BLOG PAGINATION END --- */}
        </div>
      </section>
    </>
  );
};

export default BlogGrid;