"use client";
import React from "react";
import { useProducts } from "@/hooks/useProducts";
import SingleItem from "@/components/Shop/SingleItem";
import Breadcrumb from "@/components/Common/Breadcrumb";

const RecentlyViewedPage = () => {
  const { products, loading } = useProducts();
  const recentlyViewed = products.slice(0, 12); // Show more items on dedicated page

  if (loading) {
    return (
      <>
        <Breadcrumb title="Recently Viewed" pages={["Recently Viewed"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <p className="text-dark">Loading recently viewed items...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Recently Viewed" pages={["Recently Viewed"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Recently Viewed Items</h2>
            <p className="text-dark-4">{recentlyViewed.length} items</p>
          </div>

          {recentlyViewed.length === 0 ? (
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <p className="text-dark-4 mb-4">No recently viewed items yet</p>
              <p className="text-custom-sm text-dark-4">
                Start browsing our products to see them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7.5">
              {recentlyViewed.map((item) => (
                <SingleItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default RecentlyViewedPage;
