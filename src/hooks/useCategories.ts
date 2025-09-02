import { useState, useEffect } from 'react'
import { categoriesApi, Category } from '@/lib/api'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await categoriesApi.getAll()
        setCategories(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error, refetch: () => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await categoriesApi.getAll()
        setCategories(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }}
}
