import { useState, useEffect, useRef } from 'react'
import { productsApi, Product } from '@/lib/api'

/**
 * Products from /api/products. Pass `initialProducts` (loaded on the server for the same params)
 * to render them at once and skip the first fetch; a later change of params fetches as usual.
 */
export function useProducts(params?: {
  category?: string
  featured?: boolean
  inStock?: boolean
  page?: number
  limit?: number
}, initialProducts?: Product[]) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? [])
  const [loading, setLoading] = useState(!initialProducts)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const paramsKey = JSON.stringify(params ?? {})
  // The params the server data belongs to. Kept (not cleared) on the first run, so the
  // second effect run in React Strict Mode does not fetch the same products again.
  const initialKey = useRef(initialProducts ? paramsKey : null)

  useEffect(() => {
    if (initialKey.current === paramsKey) return
    initialKey.current = null
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
  }, [
    params?.category, 
    params?.featured, 
    params?.inStock, 
    params?.page, 
    params?.limit,
    // Add JSON.stringify to ensure object changes trigger re-fetch
    paramsKey
  ])

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
