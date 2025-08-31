import { useState, useEffect } from 'react';
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

export const useSearch = (params: SearchParams = {}) => {
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (searchParams: SearchParams) => {
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

      const response = await fetch(`/api/products/search?${urlParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      searchProducts(params);
    }
  }, [JSON.stringify(params)]);

  return {
    data,
    loading,
    error,
    searchProducts,
  };
};
