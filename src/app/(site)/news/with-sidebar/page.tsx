"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SearchForm from "@/components/Blog/SearchForm";
import LatestPosts from "@/components/Blog/LatestPosts";
import LatestProducts from "@/components/Blog/LatestProducts";
import NewsGrid from "@/components/News/NewsGrid";

const NewsWithSidebarPage = () => {
  // State for dynamic tags
  const [tags, setTags] = useState<{id: number, name: string, slug: string}[]>([]);

  useEffect(() => {
    // Fetch tags for the sidebar
    fetch('/api/admin/tags')
      .then(res => res.json())
      .then(data => setTags(data.tags || []));
  }, []);

  return (
    <main>
      <Breadcrumb title="News" />
      
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* Main Content */}
            <div className="w-full lg:w-2/3">
              <NewsGrid />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <div className="space-y-8">
                {/* Search */}
                <div className="bg-white rounded-lg shadow-1 p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">Search News</h3>
                  <SearchForm />
                </div>

                {/* Latest News */}
                <div className="bg-white rounded-lg shadow-1 p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">Latest News</h3>
                  <LatestPosts />
                </div>

                {/* Popular Tags */}
                <div className="bg-white rounded-lg shadow-1 p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <a
                        key={tag.id}
                        href={`/news?tag=${tag.slug}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Latest Products */}
                <div className="bg-white rounded-lg shadow-1 p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">Latest Products</h3>
                  <LatestProducts />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NewsWithSidebarPage;
