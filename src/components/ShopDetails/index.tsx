"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import { sanitizeHtml } from "@/lib/sanitize";
import RecentlyViewdItems from "./RecentlyViewd";
import NotifyMeModal from "../NotifyMeModal";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useWishlist } from "@/app/context/WishlistContext";
import Link from "next/link";
import StarRating from "@/components/Common/StarRating";
import toast from "react-hot-toast";
import MushroomBenefitsIcon from "../Shop/MushroomBenefitsIcon";

interface ProductDetails {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  measurementValue: number;
  measurementType: string;
  quantity?: number;
  stockQuantity?: number;
  inStock: boolean;
  featured: boolean;
  isOutOfStock?: boolean;
  hasDiscount?: boolean;
  discountPercentage?: number;
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
  specifications: string[];
  howToConsume: string[];
  additionalInfo: { label: string; value: string }[];
  categories: { category: { id: number; title: string; slug: string } }[];
  averageRating?: number;
  reviewCount?: number;
  reviews?: number;
  category?: string[];
  reviewsList?: {
    name: string;
    avatar?: string;
    role?: string;
    rating: number;
    comment: string;
  }[];
  measurement?: {
    value: number;
    type: string;
  };
  benefits?: any;
}

const ShopDetails = () => {
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tabOne");
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // NotifyMe modal state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const handlePurchaseNow = () => {
    if (!displayProduct || !displayProduct.id) return; // Safety check

    // Dispatch the action to add the item to the cart
    dispatch(
      addItemToCart({
        id: displayProduct.id,
        title: displayProduct.title || "",
        price: displayProduct.price || 0,
        discountedPrice: displayProduct.discountedPrice,
        quantity: quantity,
        stockQuantity: displayProduct.stockQuantity,
        imgs: displayProduct.imgs,
      })
    );

    // Navigate to the checkout page
    router.push("/checkout");
  };

  const handleWishlistToggle = async () => {
    if (!displayProduct?.id) return;

    setIsWishlistLoading(true);
    try {
      if (isInWishlist(displayProduct.id)) {
        const success = await removeFromWishlist(displayProduct.id);
        if (success) {
          toast.success("Removed from wishlist");
        }
      } else {
        const success = await addToWishlist(displayProduct.id);
        if (success) {
          toast.success("Added to wishlist!");
        }
      }
    } catch (error) {
      toast.error("Please sign in to manage wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleNotifyMe = () => {
    setNotifyModalOpen(true);
  };

  const handleCloseNotifyModal = () => {
    setNotifyModalOpen(false);
  };

  const tabs = [
    { id: "tabOne", title: "Description" },
    { id: "tabTwo", title: "Additional Information" },
    { id: "tabThree", title: "Reviews" },
  ];

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  const productFromStorage = useAppSelector(
    (state) => state.productDetailsReducer.value
  );

  useEffect(() => {
    setIsClient(true);

    // Fetch product by slug from URL
    if (slug) {
      fetchProductBySlug(slug);
    } else {
      // Fallback to localStorage for backward compatibility
      const alreadyExist = localStorage.getItem("productDetails");
      const resolvedProduct =
        productFromStorage && productFromStorage.title
          ? productFromStorage
          : alreadyExist
            ? JSON.parse(alreadyExist)
            : {};

      setProduct(resolvedProduct);

      if (resolvedProduct.id) {
        fetchProductWithDiscounts(resolvedProduct.id);
      }
    }
  }, [slug, productFromStorage]);

  useEffect(() => {
    const handleRouteChange = () => {
      // Clear stale product data from localStorage when route changes
      localStorage.removeItem("productDetails");
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const fetchProductBySlug = async (productSlug: string) => {
    try {
      setProductLoading(true);

      const response = await fetch(`/api/products?slug=${productSlug}`);

      if (!response.ok) {
        throw new Error('Failed to fetch product by slug');
      }

      const data = await response.json();

      // Find the specific product from the response
      const productBySlug = data.products?.find((p: any) => p.slug === productSlug);

      if (productBySlug) {
        // Always use fresh API data — don't merge with stale state
        const updatedProduct = {
          ...productBySlug,
          discountPercentage: productBySlug.discountPercentage,
          hasDiscount: productBySlug.hasDiscount,
          discountedPrice: productBySlug.discountedPrice,
          measurement: productBySlug.measurementValue && productBySlug.measurementType ? {
            value: productBySlug.measurementValue,
            type: productBySlug.measurementType
          } : productBySlug.measurement
        };

        setProduct(updatedProduct);
        // Don't cache in localStorage — always fetch fresh from API
      }
    } catch (error) {
      console.error('Error fetching product by slug:', error);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchProductWithDiscounts = async (productId: number) => {
    try {
      setProductLoading(true);
      const response = await fetch(`/api/products?id=${productId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();

      // Find the specific product from the response
      const productWithDiscounts = data.products?.find((p: any) => p.id === productId);

      if (productWithDiscounts) {
        // Always use fresh API data
        const updatedProduct = {
          ...productWithDiscounts,
          discountPercentage: productWithDiscounts.discountPercentage,
          hasDiscount: productWithDiscounts.hasDiscount,
          discountedPrice: productWithDiscounts.discountedPrice,
          measurement: productWithDiscounts.measurementValue && productWithDiscounts.measurementType ? {
            value: productWithDiscounts.measurementValue,
            type: productWithDiscounts.measurementType
          } : product.measurement
        };

        setProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Error fetching product with discounts:', error);
    } finally {
      setProductLoading(false);
    }
  };

  // Fetch reviews when product changes
  useEffect(() => {
    if (product && product.id) {
      fetchReviews();
    }
  }, [product?.id]);

  const fetchReviews = async () => {
    if (!product || !product.id) return;

    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/reviews?productId=${product.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setReviewStats({
        totalReviews: data.totalReviews,
        averageRating: data.averageRating
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product.id) {
      alert('Product not found');
      return;
    }

    if (!comment.trim()) {
      alert('Please add a comment to your review');
      return;
    }

    try {
      setIsSubmittingReview(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          rating: rating,
          comment: comment.trim()
        })
      });

      if (!response.ok) {
        // Handle non-JSON error responses
        let errorMessage = 'Failed to submit review';
        try {
          const responseData = await response.json();
          errorMessage = responseData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use status text or generic message
          errorMessage = response.statusText || `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      // Reset form and refresh reviews
      setRating(5);
      setComment('');
      await fetchReviews();
      alert('Review submitted successfully!');
    } catch (error: any) {
      console.error('Review submission error:', error);
      alert(error.message || 'Failed to submit review. Please make sure you are signed in.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayProduct = product;

  useEffect(() => {
    if (product && product.title) {
      // Track product view in recently viewed with debounce
      if (product.id) {
        const timeoutId = setTimeout(() => {
          addToRecentlyViewed(product.id);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [product?.id, product?.title, addToRecentlyViewed]);

  return (
    <>
      <Breadcrumb title={displayProduct?.title || "Shop Details"} pages={["shop", "details"]} />

      {!displayProduct || !displayProduct.title ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-lg text-dark">Please select a product to view details.</p>
        </div>
      ) : (
        <>
          <section className="py-10 sm:py-14 bg-gray-50">
            <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left — Image card */}
                <div className="lg:max-w-[520px] w-full bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
                  <div className="lg:min-h-[450px] rounded-xl bg-gray-50 p-6 sm:p-8 relative flex items-center justify-center">
                    {!displayProduct.inStock && (
                      <div className="sold-out-overlay sold-out-lg"><span>Sold Out</span></div>
                    )}
                    {/* Preview / zoom button */}
                    <button
                      onClick={() => {
                        if (displayProduct?.imgs?.previews) {
                          openPreviewModal({ title: displayProduct.title, imgs: displayProduct.imgs });
                        }
                      }}
                      aria-label="View full image"
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-forest hover:border-forest transition-all duration-200"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <div className="relative">
                      <Image
                        className={!displayProduct.inStock ? "grayscale" : ""}
                        src={
                          displayProduct.imgs?.previews?.slice(1)[previewImg] ??
                          displayProduct.imgs?.previews?.[0] ??
                          displayProduct.imgs?.thumbnails?.slice(1)[previewImg] ??
                          displayProduct.imgs?.thumbnails?.[0] ??
                          "/images/placeholder.png"
                        }
                        alt="products-details"
                        width={400}
                        height={400}
                      />
                      <div className="absolute bottom-4 left-4 z-10">
                        <MushroomBenefitsIcon product={displayProduct} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                    {displayProduct.imgs?.thumbnails.slice(1).map((item, key) => (
                      <button
                        onClick={() => setPreviewImg(key)}
                        key={key}
                        className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-xl bg-cream border-2 hover:border-forest transition-colors duration-200 ${key === previewImg ? "border-forest" : "border-transparent"
                          }`}
                      >
                        <Image
                          className={!displayProduct.inStock ? "grayscale" : ""}
                          width={50}
                          height={50}
                          src={item}
                          alt="thumbnail"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Right — Product info card */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 sm:p-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-medium text-2xl sm:text-3xl text-dark">
                      {displayProduct.title}
                    </h2>
                    {displayProduct.hasDiscount && displayProduct.discountPercentage && (
                      <div className="inline-flex font-medium text-[10px] font-medium uppercase tracking-wider text-white bg-forest rounded-full py-1 px-3">
                        {displayProduct.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                    <div className="flex items-center gap-2.5">
                      <StarRating rating={reviewStats.averageRating || 0} count={reviewStats.totalReviews} size={18} />
                    </div>
                    {displayProduct.inStock ? (
                      <div className="flex items-center gap-1.5">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z" fill="#22AD5C" />
                          <path d="M12.6875 7.09374L8.9688 10.7187L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z" fill="#22AD5C" />
                        </svg>
                        <span className="text-green"> In Stock </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12.5 7.5L7.5 12.5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M7.5 7.5L12.5 12.5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-medium text-red-500"> Out of Stock </span>
                      </div>
                    )}
                  </div>
                  <div className="mb-4.5">
                    <div className="flex items-center gap-3">
                      {displayProduct.hasDiscount ? (
                        <>
                          <span className="font-semibold text-2xl text-dark">₹{displayProduct.discountedPrice}</span>
                          <span className="text-dark-5 line-through text-base">₹{displayProduct.price}</span>
                          <span className="text-xs font-medium text-white bg-forest px-2.5 py-1 rounded-full">
                            Save ₹{(displayProduct.price - (displayProduct.discountedPrice || displayProduct.price)).toFixed(0)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-2xl text-dark">₹{displayProduct.price}</span>
                      )}
                    </div>
                    {displayProduct.hasDiscount && displayProduct.discountPercentage && (
                      <p className="text-xs text-forest mt-1.5">
                        Inclusive of all taxes. You save {displayProduct.discountPercentage}% on this product.
                      </p>
                    )}
                  </div>

                  <ul className="flex flex-col gap-2 mb-6">
                    <li className="flex items-center gap-2.5">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3589 8.35863C13.603 8.11455 13.603 7.71882 13.3589 7.47475C13.1149 7.23067 12.7191 7.23067 12.4751 7.47475L8.75033 11.1995L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z" fill="#5c8e61" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.0003 1.04169C5.05277 1.04169 1.04199 5.05247 1.04199 10C1.04199 14.9476 5.05277 18.9584 10.0003 18.9584C14.9479 18.9584 18.9587 14.9476 18.9587 10C18.9587 5.05247 14.9479 1.04169 10.0003 1.04169ZM2.29199 10C2.29199 5.74283 5.74313 2.29169 10.0003 2.29169C14.2575 2.29169 17.7087 5.74283 17.7087 10C17.7087 14.2572 14.2575 17.7084 10.0003 17.7084C5.74313 17.7084 2.29199 14.2572 2.29199 10Z" fill="#5c8e61" />
                      </svg>
                      Free Delivery on orders above ₹1999
                    </li>
                    {displayProduct.measurement && (
                      <li className="flex items-center gap-2.5">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3589 8.35863C13.603 8.11455 13.603 7.71882 13.3589 7.47475C13.1149 7.23067 12.7191 7.23067 12.4751 7.47475L8.75033 11.1995L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z" fill="#5c8e61" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M10.0003 1.04169C5.05277 1.04169 1.04199 5.05247 1.04199 10C1.04199 14.9476 5.05277 18.9584 10.0003 18.9584C14.9479 18.9584 18.9587 14.9476 18.9587 10C18.9587 5.05247 14.9479 1.04169 10.0003 1.04169ZM2.29199 10C2.29199 5.74283 5.74313 2.29169 10.0003 2.29169C14.2575 2.29169 17.7087 5.74283 17.7087 10C17.7087 14.2572 14.2575 17.7084 10.0003 17.7084C5.74313 17.7084 2.29199 14.2572 2.29199 10Z" fill="#5c8e61" />
                        </svg>
                        Weight : {displayProduct.measurement.value}{displayProduct.measurement.type}
                      </li>
                    )}
                  </ul>

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-wrap items-center gap-4.5">
                      {displayProduct.inStock && (
                        <>
                          <div className="flex items-center rounded-full border border-gray-200">
                            <button aria-label="button for remove product" className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-forest" onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
                              <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.33301 10C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" /></svg>
                            </button>
                            <span className="flex items-center justify-center w-16 h-12 border-x border-gray-200">{quantity}</span>
                            <button onClick={() => { const maxQty = displayProduct?.stockQuantity ?? Infinity; if (quantity < maxQty) setQuantity(quantity + 1); }} aria-label="button for add product" className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-forest">
                              <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" /><path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" /></svg>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handlePurchaseNow}
                            className="inline-flex font-medium text-white bg-forest py-3 px-8 rounded-full transition-colors duration-300 hover:bg-dark"
                          >
                            Purchase Now
                          </button>
                          <button
                            onClick={handleWishlistToggle}
                            disabled={isWishlistLoading}
                            className={`flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-3 shadow-sm hover:shadow-md ease-out duration-200 ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            aria-label={isInWishlist(displayProduct.id || 0) ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24">
                              <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                fill={isInWishlist(displayProduct.id || 0) ? "#ef4444" : "none"}
                                stroke={isInWishlist(displayProduct.id || 0) ? "#ef4444" : "#9ca3af"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <Link
                            href="https://wa.me/917618362662"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Contact via WhatsApp"
                            className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 ease-out duration-200 text-[#25D366] hover:text-green-600 hover:bg-green-50 hover:border-green-500"
                          >
                            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                                fillRule="evenodd"
                              />
                            </svg>
                          </Link>
                        </>
                      )}

                      {!displayProduct.inStock && (
                        <button
                          onClick={handleNotifyMe}
                          className="inline-flex font-medium text-white bg-forest py-3 px-7 rounded-full ease-out duration-200 hover:bg-dark"
                        >
                          Notify Me
                        </button>
                      )}
                    </div>
                    {displayProduct?.stockQuantity !== undefined && displayProduct.stockQuantity > 0 && displayProduct.stockQuantity <= 10 && (
                      <p className="text-sm text-red font-medium mt-3">Only {displayProduct.stockQuantity} left in stock</p>
                    )}
                  </form>

                  {/* Tabs — right below buy buttons, at eye level */}
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex gap-6 border-b border-gray-200">
                      {tabs.map((item, key) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(item.id)}
                          className={`pb-3 text-sm font-medium transition-colors relative ${
                            activeTab === item.id
                              ? "text-forest border-b-2 border-forest -mb-[1px]"
                              : "text-dark-5 hover:text-dark"
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>

                    {/* Tab: Description */}
                    <div className={`pt-5 ${activeTab === "tabOne" ? "block" : "hidden"}`}>
                      {displayProduct.description && (
                        <div className="text-sm text-dark-4 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: sanitizeHtml(displayProduct.description) }} />
                      )}
                      {Array.isArray(displayProduct.specifications) && displayProduct.specifications.length > 0 && (
                        <div className="mb-5">
                          <h4 className="text-sm font-semibold text-dark mb-2">Specifications</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-dark-4">
                            {displayProduct.specifications.map((spec: string, idx: number) => (
                              <li key={idx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(spec) }} />
                            ))}
                          </ul>
                        </div>
                      )}
                      {displayProduct.howToConsume?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-dark mb-2">How to Consume</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-dark-4">
                            {displayProduct.howToConsume.map((step: string, i: number) => (
                              <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(step) }} />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Tab: Additional Info */}
                    <div className={`pt-5 ${activeTab === "tabTwo" ? "block" : "hidden"}`}>
                      {Array.isArray(displayProduct.additionalInfo) && displayProduct.additionalInfo.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {displayProduct.additionalInfo.map((info: { label: string; value: string }, idx: number) => (
                            <div key={idx} className="flex py-3 text-sm">
                              <span className="w-[140px] flex-shrink-0 text-dark-5 font-medium">{info.label}</span>
                              <span className="text-dark">{info.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-dark-5">No additional information available.</p>
                      )}
                    </div>

                    {/* Tab: Reviews */}
                    <div className={`pt-5 ${activeTab === "tabThree" ? "block" : "hidden"}`}>
                      {/* Rating summary */}
                      {reviewStats.totalReviews > 0 && (
                        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
                          <div className="flex items-center gap-1.5 bg-forest text-white text-lg font-semibold px-3 py-1.5 rounded-lg">
                            {reviewStats.averageRating.toFixed(1)}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark">{reviewStats.totalReviews} Rating{reviewStats.totalReviews !== 1 ? "s" : ""} & Review{reviewStats.totalReviews !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      )}

                      {/* Review list — compact cards */}
                      {reviewsLoading ? (
                        <p className="text-sm text-dark-5 py-4">Loading reviews...</p>
                      ) : reviews && reviews.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {reviews.map((review: any, idx: number) => (
                            <div key={idx} className="py-4 first:pt-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-1 bg-forest text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                                  {review.rating}
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                </div>
                                <span className="text-sm font-medium text-dark">{review.user?.name || "Anonymous"}</span>
                                <span className="text-xs text-dark-5">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-dark-4 leading-relaxed">{review.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-dark-5 py-4">No reviews yet. Be the first to review!</p>
                      )}

                      {/* Write a review — compact form */}
                      <div className="mt-6 pt-5 border-t border-gray-100">
                        <form onSubmit={handleReviewSubmit}>
                          <h4 className="text-sm font-semibold text-dark mb-3">Write a Review</h4>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs text-dark-5">Your rating:</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setRating(i + 1)}
                                  className={`${i < rating ? "text-[#FBB040]" : "text-gray-300"}`}
                                >
                                  <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            name="comments"
                            rows={3}
                            placeholder="Share your experience with this product..."
                            value={comment}
                            onChange={(e) => { if (e.target.value.length <= 250) setComment(e.target.value); }}
                            maxLength={250}
                            className="rounded-lg border border-gray-200 bg-gray-1 placeholder:text-dark-5 w-full p-3 text-sm outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20 mb-2"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-dark-5">{comment.length}/250</span>
                            <button
                              type="submit"
                              disabled={isSubmittingReview}
                              className="text-sm font-medium text-white bg-forest py-2 px-6 rounded-full hover:bg-dark transition-colors disabled:opacity-50"
                            >
                              {isSubmittingReview ? "Submitting..." : "Submit"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <RecentlyViewdItems />
          <Newsletter />
        </>
      )}

      {/* NotifyMe Modal */}
      {displayProduct && (
        <NotifyMeModal
          isOpen={notifyModalOpen}
          onClose={handleCloseNotifyModal}
          productId={displayProduct.id || 0}
          productTitle={displayProduct.title || "Product"}
        />
      )}
    </>
  );
};

export default ShopDetails;