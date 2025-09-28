"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SearchForm from "@/components/Blog/SearchForm";
import LatestNews from "@/components/News/LatestNews";
import NewsGrid from "@/components/News/NewsGrid";

const NewsWithSidebarPage = () => {
  // State for dynamic tags
  const [tags, setTags] = useState<{id: number, name: string, slug: string}[]>([]);
  // State for latest news
  const [latestNews, setLatestNews] = useState<{id: number, title: string, img: string, date: string, views: number, slug: string}[]>([]);

  useEffect(() => {
    // Fetch tags for the sidebar
    fetch('/api/admin/tags')
      .then(res => res.json())
      .then(data => setTags(data.tags || []));
    
    // Fetch latest news
    fetch('/api/news?page=1&limit=3')
      .then(res => res.json())
      .then(data => {
        const formattedNews = data.news?.map((item: any) => ({
          id: item.id,
          title: item.title,
          img: item.img,
          date: new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          views: item.views,
          slug: item.slug
        })) || [];
        setLatestNews(formattedNews);
      });
  }, []);

  return (
    <main>
      <Breadcrumb title="News" pages={["News"]} />
      
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
                <LatestNews news={latestNews} />

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

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NewsWithSidebarPage;
