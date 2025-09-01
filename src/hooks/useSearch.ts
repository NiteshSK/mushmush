import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '@/types/product';

interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

interface SearchResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useSearch = () => {
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchProducts = useCallback(async (searchParams: SearchParams) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams();
      
      if (searchParams.query) urlParams.set('q', searchParams.query);
      if (searchParams.category) urlParams.set('category', searchParams.category);
      if (searchParams.minPrice !== undefined) urlParams.set('minPrice', searchParams.minPrice.toString());
      if (searchParams.maxPrice !== undefined) urlParams.set('maxPrice', searchParams.maxPrice.toString());
      if (searchParams.page) urlParams.set('page', searchParams.page.toString());
      if (searchParams.limit) urlParams.set('limit', searchParams.limit.toString());

      const response = await fetch(`/api/products/search?${urlParams.toString()}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't update error state
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup function to cancel ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    searchProducts,
  };
};
