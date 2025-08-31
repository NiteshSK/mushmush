"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const router = useRouter();
  const dispatch = useDispatch();
  const { products, loading, error } = useProducts();

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
    dispatch(updateproductDetails(product));
    router.push("/shop-details");
  };

  const categoriesWithCounts = useMemo(() => {
    const categoryCount: { [key: string]: number } = {};
    products.forEach(product => {
      product.categories?.forEach(cat => {
        const categoryTitle = cat.category.title;
        categoryCount[categoryTitle] = (categoryCount[categoryTitle] || 0) + 1;
      });
    });
    return Object.entries(categoryCount).map(([name, count]) => ({
      name: name,
      products: count,
    }));
  }, [products]);

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  useEffect(() => {
    if (initialCategory) {
      const capitalizedInitialCat = initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1);
      setSelectedCategories([capitalizedInitialCat]);
    } else {
      setSelectedCategories([]);
    }
  }, [initialCategory]);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // --- COMBINED FILTERING LOGIC ---
  const filteredProducts: Product[] = useMemo(() => {
    let filteredProducts = products;

    // 1. Filter by category
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.categories?.some(cat =>
          selectedCategories.includes(cat.category.title)
        )
      );
    }

    // 2. Filter by price
    filteredProducts = filteredProducts.filter(product => product.price <= priceValue);

    return filteredProducts;
  }, [products, selectedCategories, priceValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceValue]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    const handleStickyMenu = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

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
        pages={["shop", "/", "shop with sidebar"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-5 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto" : "-translate-x-full"
              }`}
            >
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p>Filters:</p>
                      <button onClick={() => {
                        setSelectedCategories([]);
                        setPriceValue(maxPrice);
                      }} className="text-blue">Clean All</button>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-1 rounded-lg p-5">
                    <h4 className="font-semibold text-lg text-dark mb-5">Category</h4>
                    <div className="flex flex-col gap-4">
                      {categoriesWithCounts.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`category-${category.name}`}
                              checked={selectedCategories.includes(category.name)}
                              onChange={() => handleCategoryChange(category.name)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`category-${category.name}`} className="cursor-pointer text-base text-dark">
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
              </form>
            </div>

            <div className="xl:max-w-[870px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />
                    <p>
                      Showing{" "}
                      <span className="text-dark">
                        {currentProducts.length} of {filteredProducts.length}
                      </span>{" "}
                      Products
                    </p>
                  </div>
                </div>
              </div>

              {currentProducts.length > 0 ? (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }`}
                >
                  {currentProducts.map((item, index) => (
                    <div key={item.id} onClick={() => handleProductClick(item)} className="cursor-pointer">
                      {productStyle === "grid" ? (
                        <SingleGridItem item={item} priority={index < 3} />
                      ) : (
                        <SingleListItem item={item} priority={index < 2} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-60 bg-white rounded-lg shadow-1">
                  <p className="text-lg font-medium text-gray-500">No Products Found</p>
                </div>
              )}

              {totalPages > 0 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center">
                      <li>
                        <button
                          aria-label="button for previous page"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          ←
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
                          →
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

export default ShopWithSidebar;
