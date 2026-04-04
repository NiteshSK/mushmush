"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
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
        // Set the product data
        const updatedProduct = {
          ...product,
          ...productBySlug,
          discountPercentage: productBySlug.discountPercentage,
          hasDiscount: productBySlug.hasDiscount,
          discountedPrice: productBySlug.discountedPrice,
          // Preserve measurement structure
          measurement: productBySlug.measurementValue && productBySlug.measurementType ? {
            value: productBySlug.measurementValue,
            type: productBySlug.measurementType
          } : productBySlug.measurement
        };

        setProduct(updatedProduct);
        localStorage.setItem("productDetails", JSON.stringify(updatedProduct));
      } else {
        // Fallback to localStorage
        const alreadyExist = localStorage.getItem("productDetails");
        if (alreadyExist) {
          setProduct(JSON.parse(alreadyExist));
        }
      }
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      // Fallback to localStorage
      const alreadyExist = localStorage.getItem("productDetails");
      if (alreadyExist) {
        setProduct(JSON.parse(alreadyExist));
      }
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
        // Merge the fresh data with existing product data, preserving structure
        const updatedProduct = {
          ...product,
          ...productWithDiscounts,
          discountPercentage: productWithDiscounts.discountPercentage,
          hasDiscount: productWithDiscounts.hasDiscount,
          discountedPrice: productWithDiscounts.discountedPrice,
          // Preserve measurement structure
          measurement: productWithDiscounts.measurementValue && productWithDiscounts.measurementType ? {
            value: productWithDiscounts.measurementValue,
            type: productWithDiscounts.measurementType
          } : product.measurement
        };

        setProduct(updatedProduct);
        localStorage.setItem("productDetails", JSON.stringify(updatedProduct));
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
      localStorage.setItem("productDetails", JSON.stringify(product));
      // Track product view in recently viewed with debounce
      if (product.id) {
        const timeoutId = setTimeout(() => {
          addToRecentlyViewed(product.id);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [product?.id, product?.title, addToRecentlyViewed]);

  const handlePreviewSlider = () => {
    if (displayProduct && displayProduct.imgs && displayProduct.imgs.previews) {
      openPreviewModal({
        title: displayProduct.title,
        imgs: displayProduct.imgs,
      });
    }
  };
  return (
    <>
      <Breadcrumb title={displayProduct?.title || "Shop Details"} pages={["shop", "details"]} />

      {!displayProduct || !displayProduct.title ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-lg text-dark">Please select a product to view details.</p>
        </div>
      ) : (
        <>
          <section className="py-12 sm:py-16">
            <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
                <div className="lg:max-w-[570px] w-full">
                  <div className="lg:min-h-[512px] rounded-2xl bg-cream p-6 sm:p-8 relative flex items-center justify-center">
                    {!displayProduct.inStock && (
                      <div className="sold-out-overlay sold-out-lg"><span>Sold Out</span></div>
                    )}
                    <div className="relative">
                      <button
                        onClick={handlePreviewSlider}
                        aria-label="button for zoom"
                        className="gallery__Image w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center ease-out duration-200 text-dark hover:text-forest absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                      >
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458ZM1.83331 16.765C2.21301 16.765 2.52081 17.0744 2.52081 17.4541C2.52081 19.2023 2.52227 20.4445 2.64893 21.3867C2.77292 22.4098 3.00545 23.0407 3.39339 23.4287C3.78133 23.8167 4.31268 24.0495 5.23492 24.1736C6.17695 24.3007 7.41873 24.3021 9.16665 24.3021C9.54634 24.3021 9.85415 24.61 9.85415 24.9907C9.85415 25.3714 9.54634 25.6738 9.16665 25.6738H9.11494C7.43032 25.6739 6.09599 25.6739 5.05171 25.5338C3.97699 25.3893 3.10712 25.0848 2.42112 24.3988C1.73512 23.7128 1.43068 23.043 1.28619 21.9683C1.14579 20.924 1.1458 19.5896 1.14581 17.885L1.14581 17.8333C1.14581 17.4536 1.45362 17.1458 1.83331 17.1458ZM20.1666 17.1458C20.5463 17.1458 20.8541 17.4536 20.8541 17.8333V17.885C20.8542 19.5896 20.8542 20.924 20.7138 21.9683C20.5693 23.043 20.2648 23.7128 19.5788 24.3988C18.8928 25.0848 18.023 25.3893 16.9483 25.5338C15.904 25.6739 14.5696 25.6739 12.885 25.6738H12.8333C12.4536 25.6738 12.1458 25.3714 12.1458 24.9907C12.1458 24.61 12.4536 24.3021 12.8333 24.3021C14.5812 24.3021 15.823 24.3007 16.765 24.1736C17.6873 24.0495 18.2186 23.8167 18.6066 23.4287C18.9945 23.0407 19.227 22.4098 19.351 21.3867C19.4777 20.4445 19.4791 19.2023 19.4791 17.4541C19.4791 17.0744 19.787 16.765 20.1666 16.765ZM1.83331 16.765C2.21301 16.765 2.52081 17.0744 2.52081 17.4541C2.52081 19.2023 2.52227 20.4445 2.64893 21.3867C2.77292 22.4098 3.00545 23.0407 3.39339 23.4287C3.78133 23.8167 4.31268 24.0495 5.23492 24.1736C6.17695 24.3007 7.41873 24.3021 9.16665 24.3021C9.54634 24.3021 9.85415 24.61 9.85415 24.9907C9.85415 25.3714 9.54634 25.6738 9.16665 25.6738H9.11494C7.43032 25.6739 6.09599 25.6739 5.05171 25.5338C3.97699 25.3893 3.10712 25.0848 2.42112 24.3988C1.73512 23.7128 1.43068 23.043 1.28619 21.9683C1.14579 20.924 1.1458 19.5896 1.14581 17.885L1.14581 17.8333C1.14581 17.4536 1.45362 17.1458 1.83331 17.1458ZM20.1666 17.1458C20.5463 17.1458 20.8541 17.4536 20.8541 17.8333V17.885C20.8542 19.5896 20.8542 20.924 20.7138 21.9683C20.5693 23.043 20.2648 23.7128 19.5788 24.3988C18.8928 25.0848 18.023 25.3893 16.9483 25.5338C15.904 25.6739 14.5696 25.6739 12.885 25.6738H12.8333C12.4536 25.6738 12.1458 25.3714 12.1458 24.9907C12.1458 24.61 12.4536 24.3021 12.8333 24.3021C14.5812 24.3021 15.823 24.3007 16.765 24.1736C17.6873 24.0495 18.2186 23.8167 18.6066 23.4287C18.9945 23.0407 19.227 22.4098 19.351 21.3867C19.4777 20.4445 19.4791 19.2023 19.4791 17.4541C19.4791 17.0744 19.787 16.765 20.1666 16.765ZM1.83331 16.765C2.21301 16.765 2.52081 17.0744 2.52081 17.4541C2.52081 19.2023 2.52227 20.4445 2.64893 21.3867C2.77292 22.4098 3.00545 23.0407 3.39339 23.4287C3.78133 23.8167 4.31268 24.0495 5.23492 24.1736C6.17695 24.3007 7.41873 24.3021 9.16665 24.3021C9.54634 24.3021 9.85415 24.61 9.85415 24.9907C9.85415 25.3714 9.54634 25.6738 9.16665 25.6738H9.11494C7.43032 25.6739 6.09599 25.6739 5.05171 25.5338C3.97699 25.3893 3.10712 25.0848 2.42112 24.3988C1.73512 23.7128 1.43068 23.043 1.28619 21.9683C1.14579 20.924 1.1458 19.5896 1.14581 17.885L1.14581 17.8333C1.14581 17.4536 1.45362 17.1458 1.83331 17.1458ZM20.1666 17.1458C20.5463 17.1458 20.8541 17.4536 20.8541 17.8333V17.885C20.8542 19.5896 20.8542 20.924 20.7138 21.9683C20.5693 23.043 20.2648 23.7128 19.5788 24.3988C18.8928 25.0848 18.023 25.3893 16.9483 25.5338C15.904 25.6739 14.5696 25.6739 12.885 25.6738H12.8333C12.4536 25.6738 12.1458 25.3714 12.1458 24.9907C12.1458 24.61 12.4536 24.3021 12.8333 24.3021C14.5812 24.3021 15.823 24.3007 16.765 24.1736C17.6873 24.0495 18.2186 23.8167 18.6066 23.4287C18.9945 23.0407 19.227 22.4098 19.351 21.3867C19.4777 20.4445 19.4791 19.2023 19.4791 17.4541C19.4791 17.0744 19.787 16.765 20.1666 16.765ZM1.83331 16.765C2.21301 16.765 2.52081 17.0744 2.52081 17.4541C2.52081 19.2023 2.52227 20.4445 2.64893 21.3867C2.77292 22.4098 3.00545 23.0407 3.39339 23.4287C3.78133 23.8167 4.31268 24.0495 5.23492 24.1736C6.17695 24.3007 7.41873 24.3021 9.16665 24.3021C9.54634 24.3021 9.85415 24.61 9.85415 24.9907C9.85415 25.3714 9.54634 25.6738 9.16665 25.6738H9.11494C7.43032 25.6739 6.09599 25.6739 5.05171 25.5338C3.97699 25.3893 3.10712 25.0848 2.42112 24.3988C1.73512 23.7128 1.43068 23.043 1.28619 21.9683C1.14579 20.924 1.1458 19.5896 1.14581 17.885L1.14581 17.8333C1.14581 17.4536 1.45362 17.1458 1.83331 17.1458ZM20.1666 17.1458C20.5463 17.1458 20.8541 17.4536 20.8541 17.8333V17.885C20.8542 19.5896 20.8542 20.924 20.7138 21.9683C20.5693 23.043 20.2648 23.7128 19.5788 24.3988C18.8928 25.0848 18.023 25.3893 16.9483 25.5338C15.904 25.6739 14.5696 25.6739 12.885 25.6738H12.8333C12.4536 25.6738 12.1458 25.3714 12.1458 24.9907C12.1458 24.61 12.4536 24.3021 12.8333 24.3021C14.5812 24.3021 15.823 24.3007 16.765 24.1736C17.6873 24.0495 18.2186 23.8167 18.6066 23.4287C18.9945 23.0407 19.227 22.4098 19.351 21.3867C19.4777 20.4445 19.4791 19.2023 19.4791 17.4541C19.4791 17.0744 19.787 16.765 20.1666 16.765ZM1.83331 16.765C2.21301 16.765 2.52081 17.0744 2.52081 17.4541C2.52081 19.2023 2.52227 20.4445 2.64893 21.3867C2.77292 22.4098 3.00545 23.0407 3.39339 23.4287C3.78133 23.8167 4.31268 24.0495 5.23492 24.1736C6.17695 24.3007 7.41873 24.3021 9.16665 24.3021C9.54634 24.3021 9.85415 24.61 9.85415 24.9907C9.85415 25.3714 9.54634 25.6738 9.16665 25.6738H9.11494C7.43032 25.6739 6.09599 25.6739 5.05171 25.5338C3.97699 25.3893 3.10712 25.0848 2.42112 24.3988C1.73512 23.7128 1.43068 23.043 1.28619 21.9683C1.14579 20.924 1.1458 19.5896 1.14581 17.885L1.14581 17.8333C1.14581 17.4536 1.45362 17.1458 1.83331 17.1458ZM20.1666 17.1458C20.5463 17.1458 20.8541 17.4536 20.8541 17.8333V17.885C20.8542 19.5896 20.8542 20.924 20.7138 21.9683C20.5693 23.043 20.2648 23.7128 19.5788 24.3988C18.8928 25.0848 18.023 25.3893 16.9483 25.5338C15.904 25.6739 14.5696 25.6739 12.885 25.6738H12.8333C12.4536 25.6738 12.1458 25.3714 12.1458 24.9907C12.1458 24.61 12.4536 24.3021 12.8333 24.3021C14.5812 24.3021 15.823 24.3007 16.765 24.1736C17.6873 24.0495 18.2186 23.8167 18.6066 23.4287C18.9945 23.0407 19.227 22.4098 19.351 21.3867C19.4777 20.4445 19.4791 19.2023 19.4791 17.4541C19.4791 17.0744 19.787 16.765 20.1666 16.765Z" /></svg>
                      </button>
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
                <div className="max-w-[539px] w-full">
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
                          <span className="font-semibold text-xl text-dark">₹{displayProduct.discountedPrice}</span>
                          <span className="text-dark-4 line-through text-lg">₹{displayProduct.price}</span>
                        </>
                      ) : (
                        <span className="font-semibold text-xl text-dark">₹{displayProduct.price}</span>
                      )}
                    </div>
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

                  {/* --- UPDATED: Description is now fetched dynamically --- */}
                  {displayProduct.description && (
                    <p
                      className="mb-8 text-dark-4"
                      dangerouslySetInnerHTML={{ __html: displayProduct.description }}
                    />
                  )}

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
                          {displayProduct?.stockQuantity !== undefined && displayProduct.stockQuantity > 0 && displayProduct.stockQuantity <= 10 && (
                            <span className="text-sm text-red font-medium">Only {displayProduct.stockQuantity} left in stock</span>
                          )}
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
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-cream py-12 sm:py-16">
            <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
              <div className="flex flex-wrap items-center bg-white rounded-xl gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
                {tabs.map((item, key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(item.id)}
                    className={`font-medium lg:text-lg ease-out duration-200 hover:text-forest relative before:h-0.5 before:bg-forest before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === item.id ? "text-forest before:w-full" : "text-dark before:w-0"
                      }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <div className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-8 ${activeTab === "tabOne" ? "flex" : "hidden"}`}>
                <div className="max-w-[670px] w-full">
                  <h2 className="font-medium text-xl text-dark mb-7">Specifications:</h2>
                  {displayProduct.description || displayProduct.specifications ? (
                    <div className="space-y-4">
                      {displayProduct.description && <p className="mb-4" dangerouslySetInnerHTML={{ __html: displayProduct.description }} />}
                      {Array.isArray(displayProduct.specifications) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Processing & Potency</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {displayProduct.specifications.map((spec, idx) => (
                              <li key={idx} dangerouslySetInnerHTML={{ __html: spec }} />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="mb-4">No specifications available for this product.</p>
                    </div>
                  )}
                </div>
                <div className="max-w-[447px] w-full">
                  <h2 className="font-medium text-xl text-dark mb-7">How to consume?</h2>
                  <ul className="list-disc list-inside mb-6 space-y-2">
                    {displayProduct.howToConsume?.length ? (
                      displayProduct.howToConsume.map((step, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                      ))
                    ) : (
                      <li>No usage instructions available.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className={`${activeTab === "tabTwo" ? "block" : "hidden"}`}>
                <div className="rounded-xl bg-white p-4 sm:p-6 mt-8">
                  {Array.isArray(displayProduct.additionalInfo) && displayProduct.additionalInfo.length ? (
                    displayProduct.additionalInfo.map((info, idx) => (
                      <div key={idx} className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                        <div className="max-w-[450px] min-w-[140px] w-full">
                          <p className="text-sm sm:text-base text-dark">{info.label}</p>
                        </div>
                        <div className="w-full">
                          <p className="text-sm sm:text-base text-dark">{info.value}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <p className="mb-4">No additional information available for this product.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${activeTab === "tabThree" ? "block" : "hidden"}`}>
                <div className="flex flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-8">
                  <div className="max-w-[570px] w-full">
                    <h2 className="font-medium text-xl text-dark mb-9">
                      {reviewStats.totalReviews} Review{reviewStats.totalReviews !== 1 ? "s" : ""} for this product
                      {reviewStats.averageRating > 0 && (
                        <span className="text-lg text-gray-600 ml-2">
                          (Average: {reviewStats.averageRating}/5)
                        </span>
                      )}
                    </h2>
                    <div className="flex flex-col gap-6">
                      {reviewsLoading ? (
                        <div className="rounded-xl bg-white border border-gray-100 p-4 sm:p-6">
                          <p>Loading reviews...</p>
                        </div>
                      ) : reviews && reviews.length ? (
                        reviews.map((review, idx) => (
                          <div key={idx} className="rounded-xl bg-white border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12.5 h-12.5 rounded-full overflow-hidden bg-gray-2 flex items-center justify-center">
                                  <span className="text-lg font-medium text-dark">
                                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium text-dark">{review.user?.name || 'Anonymous'}</h3>
                                  <p className="text-custom-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <StarRating rating={typeof review.rating === 'number' ? review.rating : 0} size={15} />
                            </div>
                            {review.comment && (
                              <p className="text-dark mt-6">{review.comment}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-white border border-gray-100 p-4 sm:p-6">
                          <p>No reviews yet for this product.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="max-w-[550px] w-full">
                    <form onSubmit={handleReviewSubmit}>
                      <h2 className="font-medium text-xl text-dark mb-3.5">Add a Review</h2>
                      <p className="mb-6">Please sign in to submit a review. Required fields are marked *</p>
                      <div className="flex items-center gap-3 mb-7.5">
                        <span>Your Rating*</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setRating(i + 1)}
                              className={`cursor-pointer ${i < rating ? "text-[#FBB040]" : "text-gray-5"}`}
                            >
                              <svg className="fill-current" width="15" height="16" viewBox="0 0 15 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white border border-gray-100 p-4 sm:p-6">
                        <div className="mb-5">
                          <label htmlFor="comments" className="block mb-2.5">Comments</label>
                          <textarea
                            name="comments"
                            id="comments"
                            rows={5}
                            placeholder="Your comments"
                            value={comment}
                            onChange={(e) => { if (e.target.value.length <= 250) setComment(e.target.value); }}
                            maxLength={250}
                            className={`rounded-xl border bg-white placeholder:text-gray-400 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20 focus:border-forest ${comment.length >= 250 ? 'border-amber-400' : 'border-gray-200'}`}
                          />
                          <span className="flex items-center justify-between mt-2.5">
                            <span className="text-custom-sm text-dark-4">Maximum 250 characters</span>
                            <span className="text-custom-sm text-dark-4">{comment.length}/250</span>
                          </span>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="inline-flex font-medium text-white bg-forest py-3 px-8 rounded-full transition-colors duration-300 hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </form>
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