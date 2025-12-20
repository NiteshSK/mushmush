"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import NewsItem from "./NewsItem";
import { useNewsPosts } from "@/hooks/useNewsPosts";

const NewsGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;

  const { data, loading, error } = useNewsPosts(currentPage, newsPerPage, true);

  // Trigger scraping check on mount - API handles cooldown
  useEffect(() => {
    const triggerScraping = async () => {
      try {
        console.log('🔍 Checking if news scraping is needed...');
        
        const response = await fetch('/api/admin/scrape-news/trigger', {
          method: 'POST'
        });
        
        const result = await response.json();
        console.log('Scraping check result:', result);
        
        if (result.shouldScrape) {
          console.log('✅ News scraping initiated');
        } else {
          console.log(`ℹ️ ${result.message} - ${result.hoursRemaining || 0} hours remaining`);
        }
      } catch (error) {
        console.error('Failed to check scraping:', error);
      }
    };

    triggerScraping();
  }, []); // Runs on every mount, but API prevents duplicates

  const totalPages = data?.pagination?.pages || 1;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
        <Breadcrumb title={"News"} pages={["news"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="text-xl">Loading news articles...</div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title={"News"} pages={["news"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="text-xl text-red-500">Error loading news articles</div>
              <div className="text-sm mt-2">{error}</div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"News"} pages={["news"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-2 sm:px-8 xl:px-0">
          <div className="text-center mb-10">
            <h1 className="font-bold text-dark text-3xl sm:text-4xl xl:text-[45px] xl:leading-[55px] mb-4">
              Latest News
            </h1>
            <p className="text-base text-gray-6 max-w-[600px] mx-auto">
              Stay informed with the latest updates, announcements, and news on Mushroom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7.5">
            {data?.news?.map((article) => (
              <NewsItem
                key={article.id}
                news={{
                  date: formatDate(article.createdAt),
                  views: article.views,
                  title: article.title,
                  img:
                    typeof article.img === "string" && article.img.trim()
                      ? article.img
                      : "/images/blog/oyster-blog-01.png",
                  sourceUrl: article.sourceUrl
                }}
                slug={article.slug}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
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

export default NewsGrid;