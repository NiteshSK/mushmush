"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "./SingleGridItem";
import SingleListItem from "./SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import NotifyMeModal from "../NotifyMeModal";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";

interface ShopProps {
  showFilters?: boolean;
}

const Shop: React.FC<ShopProps> = ({ showFilters = true }) => {
  const [productStyle, setProductStyle] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [filtersVisible, setFiltersVisible] = useState(showFilters);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // NotifyMe modal state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get initial category from URL params
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  // Use API filtering for categories, client-side for price
  const { products, loading, error } = useProducts({
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined
  });

  // --- PRICE FILTER STATE ---
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1700;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100;
  }, [products]);
  const [priceValue, setPriceValue] = useState<number>(maxPrice);

  useEffect(() => {
    setPriceValue(maxPrice);
  }, [maxPrice]);

  const handleProductClick = (product: Product) => {
    // Only navigate to details if product is in stock
    if (product.inStock) {
      dispatch(updateproductDetails(product));
      router.push("/shop-details");
    }
  };

  // Handle opening notify me modal
  const handleNotifyMe = (product: Product) => {
    setSelectedProduct(product);
    setNotifyModalOpen(true);
  };

  const handleCloseNotifyModal = () => {
    setNotifyModalOpen(false);
    setSelectedProduct(null);
  };

  const categoriesWithCounts = useMemo(() => {
    const map: Record<string, { name: string; slug: string; products: number }> = {};
    products.forEach(product => {
      product.categories?.forEach(cat => {
        const title = cat.category.title;
        const slug = cat.category.slug;
        if (!map[slug]) {
          map[slug] = { name: title, slug, products: 0 };
        }
        map[slug].products += 1;
      });
    });
    return Object.values(map);
  }, [products]);

  useEffect(() => {
    if (initialCategory) {
      const exists = categoriesWithCounts.some(cat => cat.slug === initialCategory);
      setSelectedCategories(exists ? [initialCategory] : []);
    } else {
      setSelectedCategories([]);
    }
  }, [initialCategory, categoriesWithCounts]);

  const handleCategoryChange = (categorySlug: string) => {
    const newCategories = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter(c => c !== categorySlug)
      : [...selectedCategories, categorySlug];

    setSelectedCategories(newCategories);

    // Update URL to reflect category filter using slug
    const singleSlug = newCategories.length === 1 ? newCategories[0] : '';

    if (singleSlug) {
      router.push(`?category=${singleSlug}`, { scroll: false });
    } else {
      router.push(window.location.pathname, { scroll: false });
    }
  };

  // --- CLIENT-SIDE PRICE FILTERING ONLY ---
  // Category filtering is now handled by the API
  const filteredProducts: Product[] = useMemo(() => {
    // Only filter by price on client-side since category filtering is handled by API
    return products.filter(product => product.price <= priceValue);
  }, [products, priceValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceValue]); // Reset page when any filter changes

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        title={"Explore All Products"}
        pages={["shop", "/", "products"]}
      />
      <section className="overflow-hidden relative pb-4 pt-5 lg:pt-10 xl:pt-2 bg-[#f3f4f6]">
        {/* Mobile sidebar overlay */}
        {filtersVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-9998 lg:hidden"
            onClick={() => setFiltersVisible(false)}
          />
        )}

        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className={`flex gap-7.5 ${!filtersVisible ? 'justify-center' : ''}`}>
            
            {/* Collapsible Sidebar */}
            {filtersVisible && (
              <div className="sidebar-content fixed lg:z-1 z-9999 left-0 top-0 lg:translate-x-0 lg:static w-full lg:w-[270px] lg:flex-none lg:shrink-0 ease-out duration-200 translate-x-0 bg-white p-5 h-screen lg:h-auto overflow-y-auto">
                <div className="lg:hidden flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-dark">Filters</h3>
                  <button
                    onClick={() => setFiltersVisible(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Filters header card inside sidebar */}
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p>Filters:</p>
                      <button
                        onClick={() => {
                          setSelectedCategories([]);
                          setPriceValue(maxPrice);
                          setCurrentPage(1);
                          if (typeof window !== 'undefined') {
                            router.push(window.location.pathname, { scroll: false });
                          }
                        }}
                        className="text-blue"
                      >
                        Clean All
                      </button>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="bg-white shadow-1 rounded-lg p-5">
                    <h4 className="font-semibold text-lg text-dark mb-5">Category</h4>
                    <div className="flex flex-col gap-4">
                      {categoriesWithCounts.map((category) => (
                        <div key={category.slug} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`category-${category.slug}`}
                              checked={selectedCategories.includes(category.slug)}
                              onChange={() => handleCategoryChange(category.slug)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`category-${category.slug}`} className="cursor-pointer text-base text-dark">
                              {category.name}
                            </label>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {category.products}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="bg-white shadow-1 rounded-lg p-5">
                    <h4 className="font-semibold text-lg text-dark mb-4">Price</h4>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceValue}
                      onChange={(e) => setPriceValue(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-dark font-medium">₹0</span>
                      <span className="text-sm text-dark font-medium">₹{priceValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main content area */}
            <div className="w-full lg:flex-1">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="flex items-center gap-2 text-dark hover:text-blue mb-4 bg-white px-4 py-2 rounded-lg shadow-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {filtersVisible ? 'Hide Filters' : 'Show Filters'}
              </button>

              {/* Compact header with sort and count */}
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CustomSelect options={options} />
                  <p>
                    Showing{" "}
                    <span className="text-dark">
                      {currentProducts.length} of {filteredProducts.length}
                    </span>{" "}
                    Products
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProductStyle("grid")}
                    className={`p-2 rounded ${
                      productStyle === "grid" ? "bg-blue text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setProductStyle("list")}
                    className={`p-2 rounded ${
                      productStyle === "list" ? "bg-blue text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Products Display */}
              {currentProducts.length > 0 ? (
                <div
                  className={`${
                    productStyle === "grid"
                      ? `grid gap-x-7.5 gap-y-9 ${filtersVisible ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`
                      : "flex flex-col gap-7.5"
                  }`}
                >
                  {currentProducts.map((item, index) => (
                    <div key={item.id} onClick={() => handleProductClick(item)} className="cursor-pointer">
                      {productStyle === "grid" ? (
                        <SingleGridItem item={item} priority={index < 3} onNotifyMe={handleNotifyMe} />
                      ) : (
                        <SingleListItem item={item} priority={index < 2} onNotifyMe={handleNotifyMe} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-60 bg-white rounded-lg shadow-1">
                  <p className="text-lg font-medium text-gray-500">No Products Found</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center">
                      <li>
                        <button
                          aria-label="button for previous page"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4 disabled:cursor-not-allowed hover:text-white hover:bg-blue"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

      {/* NotifyMe Modal */}
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

export default Shop;
