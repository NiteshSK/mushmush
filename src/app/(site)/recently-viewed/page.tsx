"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SingleGridItem from "@/components/Shop/SingleGridItem";
import SingleListItem from "@/components/Shop/SingleListItem";
import CustomSelect from "@/components/ShopWithSidebar/CustomSelect";
import { Product } from "@/types/product";

const RecentlyViewedPage = () => {
  const { items: recentlyViewed, loading } = useRecentlyViewed();
  const [productStyle, setProductStyle] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const router = useRouter();
  const dispatch = useDispatch();

  const handleProductClick = (product: Product) => {
    dispatch(updateproductDetails(product));
    router.push("/shop-details");
  };

  // Convert recently viewed items to products array
  const products = recentlyViewed.map(item => item.product);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  if (loading) {
    return (
      <>
        <Breadcrumb
          title={"Recently Viewed Items"}
          pages={["recently viewed", "/", "loading..."]}
        />
        <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-5 bg-[#f3f4f6]">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center py-20">
              <p className="text-lg">Loading recently viewed products...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        title={"Recently Viewed Items"}
        pages={["recently viewed", "/", `${products.length} items`]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-5 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div className="xl:max-w-[1170px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />
                    <p>
                      Showing{" "}
                      <span className="text-dark">
                        {currentProducts.length} of {products.length}
                      </span>{" "}
                      Products
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProductStyle("grid")}
                      className={`p-2 rounded ${productStyle === "grid" ? "bg-blue text-white" : "bg-gray-100"}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="6" height="6" rx="1"/>
                        <rect x="9" y="1" width="6" height="6" rx="1"/>
                        <rect x="1" y="9" width="6" height="6" rx="1"/>
                        <rect x="9" y="9" width="6" height="6" rx="1"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setProductStyle("list")}
                      className={`p-2 rounded ${productStyle === "list" ? "bg-blue text-white" : "bg-gray-100"}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="2" width="14" height="2" rx="1"/>
                        <rect x="1" y="7" width="14" height="2" rx="1"/>
                        <rect x="1" y="12" width="14" height="2" rx="1"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {currentProducts.length > 0 ? (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }`}
                >
                  {currentProducts.map((item, index) => (
                    <div key={item.id} onClick={() => handleProductClick(item)} className="cursor-pointer">
                      {productStyle === "grid" ? (
                        <SingleGridItem item={item} priority={index < 4} />
                      ) : (
                        <SingleListItem item={item} priority={index < 2} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-60 bg-white rounded-lg shadow-1">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No recently viewed products</h3>
                    <p className="text-sm text-gray-500">Products you view will appear here</p>
                  </div>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center">
                      <li>
                        <button
                          aria-label="button for previous page"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M10 12l-4-4 4-4"/>
                          </svg>
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <li key={pageNumber}>
                          <button
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${
                              currentPage === pageNumber ? "bg-blue text-white" : "hover:text-white hover:bg-blue"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          aria-label="button for next page"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 4l4 4-4 4"/>
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RecentlyViewedPage;
