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
    limit: 100,
  });

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1700;
    return Math.ceil(Math.max(...products.map((p) => p.price)) / 100) * 100;
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
    const map: Record<
      string,
      { name: string; slug: string; products: number }
    > = {};
    products.forEach((product) => {
      product.categories?.forEach((cat) => {
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

  // Sync from URL only on initial mount
  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    if (categoriesWithCounts.length === 0) return; // wait for categories to load
    initializedRef.current = true;

    if (initialCategory) {
      const exists = categoriesWithCounts.some((cat) => cat.slug === initialCategory);
      if (exists) setSelectedCategories([initialCategory]);
    }
  }, [initialCategory, categoriesWithCounts]);

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug];

      // Update URL for shareability (multi-select uses comma-separated)
      if (next.length === 0) {
        router.push(window.location.pathname, { scroll: false });
      } else {
        router.push(`?category=${next.join(',')}`, { scroll: false });
      }

      return next;
    });
  };

  const filteredProducts: Product[] = useMemo(() => {
    // Filter by selected categories (multi-select)
    const categoryFiltered = selectedCategories.length > 0
      ? products.filter((p) =>
          p.categories?.some((cat) => selectedCategories.includes(cat.category.slug))
        )
      : products;

    const priceFiltered = categoryFiltered.filter(
      (product) => product.price <= priceValue
    );
    const inStock = priceFiltered.filter((p) => p.inStock);
    const outOfStock = priceFiltered.filter((p) => !p.inStock);

    const spread = (items: Product[]) => {
      const catMap: Record<string, Product[]> = {};
      items.forEach((p) => {
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
  }, [products, priceValue, selectedCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceValue]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceValue(maxPrice);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      router.push(window.location.pathname, { scroll: false });
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Shop"} pages={["Shop"]} />
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-50" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-9 bg-gray-100 rounded-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title={"Shop"} pages={["Shop"]} />
        <div className="text-center py-20 bg-white">
          <p className="text-red text-sm">Error loading products: {error}</p>
        </div>
      </>
    );
  }

  const activeFilterCount =
    selectedCategories.length + (priceValue < maxPrice ? 1 : 0);

  return (
    <>
      <Breadcrumb title={"Shop"} pages={["Shop"]} />

      <section className="py-8 sm:py-10 bg-white">
        {/* Mobile filter overlay */}
        {filtersVisible && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] lg:hidden"
            onClick={() => setFiltersVisible(false)}
          />
        )}

        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {/* ── Section header ── */}
          <div className="mb-8 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-forest mb-2">
              Our Products
            </span>
            <h2 className="font-medium text-2xl xl:text-heading-5 text-dark">
              Browse All Products
            </h2>
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  filtersVisible
                    ? "text-forest font-medium"
                    : "text-dark hover:text-forest"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="min-w-[20px] h-5 rounded-full bg-forest text-white text-[10px] flex items-center justify-center font-medium px-1.5">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-sm text-gray-5 hidden sm:inline">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setProductStyle("grid")}
                aria-label="Grid view"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  productStyle === "grid"
                    ? "text-dark"
                    : "text-gray-300 hover:text-dark"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setProductStyle("list")}
                aria-label="List view"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  productStyle === "list"
                    ? "text-dark"
                    : "text-gray-300 hover:text-dark"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Category pills (quick-filter, always visible) ── */}
          {categoriesWithCounts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`text-[13px] py-1.5 px-4 rounded-full border transition-all duration-200 ${
                    selectedCategories.includes(category.slug)
                      ? "bg-forest text-white border-forest"
                      : "bg-white text-dark border-gray-200 hover:border-dark"
                  }`}
                >
                  {category.name}
                  <span className="ml-1.5 opacity-50">{category.products}</span>
                </button>
              ))}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[13px] py-1.5 px-4 rounded-full text-gray-5 hover:text-dark underline underline-offset-2 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="flex gap-8">
            {/* ── Sidebar Filters (price + detailed) ── */}
            {filtersVisible && (
              <div className="fixed lg:static z-[9999] lg:z-auto left-0 top-0 w-[300px] sm:w-[320px] lg:w-[220px] flex-shrink-0 bg-white h-screen lg:h-auto overflow-y-auto lg:overflow-visible shadow-lg lg:shadow-none">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between border-b border-gray-100 p-5">
                  <h3 className="font-medium text-dark">Filters</h3>
                  <button
                    onClick={() => setFiltersVisible(false)}
                    className="text-gray-5 hover:text-dark transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="p-5 lg:p-0 lg:pr-2 space-y-8">
                  {/* Price */}
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-dark mb-4">
                      Price Range
                    </h4>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceValue}
                      onChange={(e) => setPriceValue(Number(e.target.value))}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-forest [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-forest [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm"
                      style={{
                        background: `linear-gradient(to right, #5c8e61 ${(priceValue / maxPrice) * 100}%, #e5e7eb ${(priceValue / maxPrice) * 100}%)`,
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-5">&#8377;0</span>
                      <span className="text-xs font-medium text-dark">&#8377;{priceValue}</span>
                    </div>
                  </div>

                  {/* Categories in sidebar (for mobile mainly, also available on desktop) */}
                  <div className="lg:hidden">
                    <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-dark mb-4">
                      Category
                    </h4>
                    <div className="flex flex-col gap-3">
                      {categoriesWithCounts.map((category) => (
                        <label
                          key={category.slug}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.slug)}
                              onChange={() => handleCategoryChange(category.slug)}
                              className="w-4 h-4 rounded border-gray-3 text-forest accent-forest focus:ring-forest"
                            />
                            <span className="text-sm text-gray-5 group-hover:text-dark transition-colors">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-5">{category.products}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile apply button */}
                <div className="lg:hidden p-5 border-t border-gray-100 mt-4">
                  <button
                    onClick={() => setFiltersVisible(false)}
                    className="w-full bg-forest text-white text-custom-sm font-medium py-3 rounded-full hover:bg-dark transition-colors"
                  >
                    Show {filteredProducts.length} products
                  </button>
                </div>
              </div>
            )}

            {/* ── Products ── */}
            <div className="flex-1 min-w-0">
              {currentProducts.length > 0 ? (
                <div
                  className={`${
                    productStyle === "grid"
                      ? `grid gap-4 ${
                          filtersVisible
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        }`
                      : "flex flex-col gap-4"
                  }`}
                >
                  {currentProducts.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item)}
                      className="cursor-pointer"
                    >
                      {productStyle === "grid" ? (
                        <SingleGridItem
                          item={item}
                          priority={index < 4}
                          onNotifyMe={handleNotifyMe}
                        />
                      ) : (
                        <SingleListItem
                          item={item}
                          priority={index < 2}
                          onNotifyMe={handleNotifyMe}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-dark font-medium mb-1">
                    No products found
                  </p>
                  <p className="text-gray-5 text-sm mb-5">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-[13px] text-gray-5 underline underline-offset-2 hover:text-dark transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="custom-prev w-8 h-8 flex items-center justify-center rounded-full border border-transparent hover:border-dark transition-all text-dark disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  <div className="flex gap-2 items-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all ${
                            currentPage === pageNumber
                              ? "bg-forest text-white font-medium"
                              : "text-gray-5 hover:text-dark"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="custom-next w-8 h-8 flex items-center justify-center rounded-full border border-transparent hover:border-dark transition-all text-dark disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
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
