"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface WishlistItem {
  id: string;
  productId: number;
  userId: string;
  createdAt: string;
  product: {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountedPrice?: number;
    measurementValue: number;
    measurementType: string;
    inStock: boolean;
    featured: boolean;
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
      role?: string;
      rating: number;
      comment: string;
      avatar?: string;
    }[];
    measurement?: {
      value: number;
      type: string;
    };
  };
}

export const useWishlist = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchWishlist = async (skipLoading = false) => {
    if (!session?.user) {
      setItems([]);
      return;
    }
    
    if (!skipLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await fetch('/api/wishlist', {
        cache: 'no-store' // Prevent caching
      });
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      setItems(data.items || []);
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');

      setItems([]); // Clear items on error
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  const addToWishlist = async (productId: number) => {
    if (!session?.user) {
      setError('Please sign in to add items to wishlist');
      return false;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
        cache: 'no-store' // Prevent caching
      });

      if (response.status === 409) {
        // Item already in wishlist, refresh and return success
        await fetchWishlist();
        return true;
      }

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      await fetchWishlist(); // Refresh wishlist
      return true;
    } catch (err) {
      console.error('Add to wishlist error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!session?.user) return false;

    // Add confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to remove this item from your wishlist?');
    if (!confirmDelete) return false;

    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        cache: 'no-store'
      });

      if (response.status === 404) {
        await fetchWishlist();
        return true;
      }

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      // Immediately update state by filtering out the removed item
      setItems(currentItems => {
        return currentItems.filter(item => item.product.id !== productId);
      });

      // Also update refresh key to trigger any dependent re-renders
      setRefreshKey(prev => prev + 1);

      return true;
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = (productId: number) => {
    return items.some(item => item.product.id === productId);
  };

  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [session]);

  return {
    items,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist
  };
};
