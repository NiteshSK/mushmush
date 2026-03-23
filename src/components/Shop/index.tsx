"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "./SingleGridItem";
import SingleListItem from "./SingleListItem";
import NotifyMeModal from "../NotifyMeModal";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";

interface ShopProps {
  showFilters?: boolean;
}

const Shop: React.FC<ShopProps> = ({ showFilters = true }) => {
  const [productStyle, setProductStyle] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const { products, loading, error } = useProducts({
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    limit: 100
  });

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1700;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100;
  }, [products]);
  const [priceValue, setPriceValue] = useState<number>(maxPrice);

  useEffect(() => {
    setPriceValue(maxPrice);
  }, [maxPrice]);

  const handleProductClick = (product: Product) => {
    if (product.inStock) {
      dispatch(updateproductDetails(product));
      router.push(`/shop-details/${product.slug}`);
    }
  };

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

    const singleSlug = newCategories.length === 1 ? newCategories[0] : '';

    if (singleSlug) {
      router.push(`?category=${singleSlug}`, { scroll: false });
    } else {
      router.push(window.location.pathname, { scroll: false });
    }
  };

  const filteredProducts: Product[] = useMemo(() => {
    const priceFiltered = products.filter(product => product.price <= priceValue);
    const inStock = priceFiltered.filter(p => p.inStock);
    const outOfStock = priceFiltered.filter(p => !p.inStock);

    // Round-robin by category so all categories are interleaved
    const spread = (items: Product[]) => {
      const catMap: Record<string, Product[]> = {};
      items.forEach(p => {
        const slug = p.categories?.[0]?.category?.slug || "other";
        if (!catMap[slug]) catMap[slug] = [];
        catMap[slug].push(p);
      });
      const result: Product[] = [];
      const keys = Object.keys(catMap);
      let idx = 0;
      while (keys.length > 0) {
        const key = keys[idx % keys.length];
        const item = catMap[key].shift();
        if (item) result.push(item);
        if (catMap[key].length === 0) {
          keys.splice(idx % keys.length, 1);
          if (keys.length === 0) break;
        } else {
          idx++;
        }
      }
      return result;
    };

    return [...spread(inStock), ...spread(outOfStock)];
  }, [products, priceValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceValue]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Shop"} pages={["Shop"]} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title={"Shop"} pages={["Shop"]} />
        <div className="text-center py-20">
          <p className="text-red-600 text-sm">Error loading products: {error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Shop"} pages={["Shop"]} />

      <section className="py-12 sm:py-16">
        {/* Mobile sidebar overlay */}
        {filtersVisible && (
          <div
            className="fixed inset-0 bg-black/40 z-9998 lg:hidden"
            onClick={() => setFiltersVisible(false)}
          />
        )}

        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="flex items-center gap-2 text-sm font-medium text-dark hover:text-forest transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                {filtersVisible ? 'Hide Filters' : 'Filters'}
              </button>
              <span className="text-sm text-gray-400">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProductStyle("grid")}
                className={`p-2 rounded-lg transition-colors ${productStyle === "grid" ? "bg-dark text-white" : "text-gray-400 hover:text-dark"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setProductStyle("list")}
                className={`p-2 rounded-lg transition-colors ${productStyle === "list" ? "bg-dark text-white" : "text-gray-400 hover:text-dark"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-6 lg:gap-8">
            {/* Sidebar Filters */}
            {filtersVisible && (
              <div className="fixed lg:static z-9999 lg:z-auto left-0 top-0 w-full lg:w-[240px] flex-shrink-0 bg-white lg:bg-transparent h-screen lg:h-auto overflow-y-auto lg:overflow-visible p-6 lg:p-0">
                <div className="lg:hidden flex items-center justify-between mb-6">
                  <h3 className="font-medium text-lg text-dark">Filters</h3>
                  <button onClick={() => setFiltersVisible(false)} className="text-gray-400 hover:text-dark">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Clear all */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Filters</span>
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setPriceValue(maxPrice);
                        setCurrentPage(1);
                        if (typeof window !== 'undefined') {
                          router.push(window.location.pathname, { scroll: false });
                        }
                      }}
                      className="text-xs text-forest hover:underline"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-medium text-dark mb-4">Category</h4>
                    <div className="flex flex-col gap-3">
                      {categoriesWithCounts.map((category) => (
                        <label key={category.slug} className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.slug)}
                              onChange={() => handleCategoryChange(category.slug)}
                              className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-dark transition-colors">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{category.products}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h4 className="text-sm font-medium text-dark mb-4">Price</h4>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceValue}
                      onChange={(e) => setPriceValue(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-forest [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-gray-200 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-forest [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-progress]:bg-forest [&::-moz-range-progress]:rounded-full"
                      style={{ background: `linear-gradient(to right, #5c8e61 ${(priceValue / maxPrice) * 100}%, #e5e7eb ${(priceValue / maxPrice) * 100}%)` }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">₹0</span>
                      <span className="text-xs text-gray-500">₹{priceValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="flex-1">
              {currentProducts.length > 0 ? (
                <div
                  className={`${
                    productStyle === "grid"
                      ? `grid gap-6 ${filtersVisible ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`
                      : "flex flex-col gap-6"
                  }`}
                >
                  {currentProducts.map((item, index) => (
                    <div key={item.id} onClick={() => handleProductClick(item)} className="cursor-pointer">
                      {productStyle === "grid" ? (
                        <SingleGridItem item={item} priority={index < 4} onNotifyMe={handleNotifyMe} />
                      ) : (
                        <SingleListItem item={item} priority={index < 2} onNotifyMe={handleNotifyMe} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-gray-400 text-sm mb-4">No products found</p>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceValue(maxPrice);
                    }}
                    className="text-sm text-forest hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-sm text-gray-400 hover:text-dark hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                          currentPage === pageNumber
                            ? "bg-dark text-white"
                            : "text-gray-500 hover:text-dark hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-sm text-gray-400 hover:text-dark hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default Shop;
