"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import SingleGridItem from "../Shop/SingleGridItem";
import NotifyMeModal from "../NotifyMeModal";
import Breadcrumb from "../Common/Breadcrumb";
import { Product } from "@/types/product";
import Link from "next/link";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('search') || searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  const { data, loading, error, searchProducts } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleNotifyMe = (product: Product) => {
    setSelectedProduct(product);
    setNotifyModalOpen(true);
  };

  const handleCloseNotifyModal = () => {
    setNotifyModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if ((query || category) && !hasSearched) {
      timeoutRef.current = setTimeout(() => {
        searchProducts({ query, category, page: 1, limit: 12 });
        setHasSearched(true);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, category, searchProducts, hasSearched]);

  useEffect(() => {
    setHasSearched(false);
  }, [query, category]);

  if (loading) {
    return (
      <>
        <Breadcrumb title="Search" pages={["Search"]} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title="Search" pages={["Search"]} />
        <div className="text-center py-20">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </>
    );
  }

  const products = data?.products || [];
  const totalResults = data?.pagination?.total || 0;

  return (
    <>
      <Breadcrumb title="Search" pages={["Search"]} />

      <section className="py-12 sm:py-16">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {/* Search info */}
          <div className="mb-10">
            {query && (
              <p className="text-sm text-gray-500 mb-1">
                Results for <span className="text-dark font-medium">"{query}"</span>
              </p>
            )}
            <p className="text-xs text-gray-400">
              {totalResults} product{totalResults !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Results */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <SingleGridItem key={product.id} item={product} onNotifyMe={handleNotifyMe} />
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h2 className="font-medium text-xl text-dark mb-2">No results found</h2>
              <p className="text-sm text-gray-400 mb-8">
                {query
                  ? `We couldn't find products matching "${query}".`
                  : "No products match your search."}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-forest text-white text-sm font-medium py-3 px-8 rounded-full hover:bg-dark transition-colors duration-300"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <NotifyMeModal
          isOpen={notifyModalOpen}
          onClose={handleCloseNotifyModal}
          productId={selectedProduct.id}
          productTitle={selectedProduct.title}
        />
      )}
    </>
  );
};

export default SearchResults;
