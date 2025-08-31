import { useState, useEffect } from 'react'
import { productsApi, Product } from '@/lib/api'

export function useProducts(params?: {
  category?: string
  featured?: boolean
  inStock?: boolean
  page?: number
  limit?: number
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await productsApi.getAll(params)
        setProducts(response.products)
        setPagination(response.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [params?.category, params?.featured, params?.inStock, params?.page, params?.limit])

  return { products, loading, error, pagination }
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await productsApi.getById(id)
        setProduct(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  return { product, loading, error }
}
