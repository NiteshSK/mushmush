'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

import { Product } from '@/types/product';

interface WishlistItem {
  id: number;
  userId: string;
  productId: number;
  product: Product;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        cache: 'no-store'
      });
      
      // Handle unauthorized response gracefully
      if (response.status === 401) {
        setItems([]);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
      setItems([]);
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  const addToWishlist = async (productId: number): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
        cache: 'no-store'
      });

      // Handle unauthorized response gracefully
      if (response.status === 401) {
        setItems([]);
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      // Refresh the wishlist to get updated data
      await fetchWishlist(true);
      return true;
    } catch (err) {
      console.error('Add to wishlist error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId: number): Promise<boolean> => {
    if (!session?.user) return false;

    // Add confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to remove this item from your wishlist?');
    if (!confirmDelete) return false;

    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        cache: 'no-store'
      });

      // Handle unauthorized response gracefully
      if (response.status === 401) {
        setItems([]);
        return false;
      }

      if (response.status === 404) {
        await fetchWishlist(true);
        return true;
      }

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      // Immediately update state by filtering out the removed item
      setItems(currentItems => 
        currentItems.filter(item => item.product.id !== productId)
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return items.some(item => item.product.id === productId);
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [session?.user]);

  const value: WishlistContextType = {
    items,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
