"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import SingleGridItem from "../Shop/SingleGridItem";
import Breadcrumb from "../Common/Breadcrumb";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('search') || searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  const { data, loading, error, searchProducts } = useSearch();

  useEffect(() => {
    if (query || category) {
      searchProducts({
        query,
        category,
        page: 1,
        limit: 12,
      });
    }
  }, [query, category, searchProducts]);

  if (loading) {
    return (
      <section className="pt-35 pb-20 lg:pt-45 lg:pb-25 xl:pt-50 xl:pb-30">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-35 pb-20 lg:pt-45 lg:pb-25 xl:pt-50 xl:pb-30">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Search Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const products = data?.products || [];
  const totalResults = data?.pagination?.total || 0;

  return (
    <>
      <Breadcrumb title="Search Results" pages={["Search Results"]} />
      
      <section className="pt-35 pb-20 lg:pt-45 lg:pb-25 xl:pt-50 xl:pb-30">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          
          {/* Search Info */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">
              Search Results
            </h1>
            {query && (
              <p className="text-gray-600 mb-2">
                Showing results for: <span className="font-semibold">"{query}"</span>
              </p>
            )}
            <p className="text-gray-600">
              {totalResults} product{totalResults !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Results */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <SingleGridItem key={product.id} item={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {query 
                  ? `We couldn't find any products matching "${query}". Try adjusting your search terms.`
                  : "No products match your current filters. Try adjusting your criteria."
                }
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Check your spelling</p>
                <p>• Try more general keywords</p>
                <p>• Browse our categories instead</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SearchResults;
