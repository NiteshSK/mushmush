import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface RecentlyViewedItem {
  id: string
  userId: string
  productId: number
  createdAt: string
  updatedAt: string
  product: {
    id: number
    title: string
    slug: string
    description: string
    price: number
    discountedPrice?: number
    measurementValue: number
    measurementType: string
    inStock: boolean
    featured: boolean
    imgs: {
      thumbnails: string[]
      previews: string[]
    }
    specifications: string[]
    howToConsume: string[]
    additionalInfo: { label: string; value: string }[]
    categories: { category: { id: number; title: string; slug: string } }[]
  }
}

export function useRecentlyViewed() {
  const { data: session } = useSession()
  const [items, setItems] = useState<RecentlyViewedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecentlyViewed = async () => {
    if (!session?.user) {
      setItems([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/recently-viewed')
      
      if (!response.ok) {
        throw new Error('Failed to fetch recently viewed products')
      }
      
      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      console.error('Recently viewed fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch recently viewed products')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const addToRecentlyViewed = async (productId: number): Promise<boolean> => {
    if (!session?.user) {
      return false
    }

    // Debounce to prevent excessive calls
    const now = Date.now()
    const lastCall = (window as any).lastRecentlyViewedCall || 0
    if (now - lastCall < 1000) { // 1 second debounce
      return false
    }
    (window as any).lastRecentlyViewedCall = now

    try {
      const response = await fetch('/api/recently-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to recently viewed')
      }

      // Don't refresh immediately to prevent query spam
      return true
    } catch (err) {
      console.error('Add to recently viewed error:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to recently viewed')
      return false
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchRecentlyViewed()
    } else {
      setItems([])
    }
  }, [session?.user])

  return {
    items,
    loading,
    error,
    addToRecentlyViewed,
    refreshRecentlyViewed: fetchRecentlyViewed
  }
}
