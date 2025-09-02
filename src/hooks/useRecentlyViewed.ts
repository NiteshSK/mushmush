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
    console.log('fetchRecentlyViewed called, session:', session?.user?.email)
    
    if (!session?.user) {
      console.log('No session user, setting empty items')
      setItems([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Making GET request to /api/recently-viewed')
      const response = await fetch('/api/recently-viewed', {
        cache: 'no-store'
      })
      
      console.log('GET Response status:', response.status)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recently viewed products')
      }
      
      const data = await response.json()
      console.log('GET Response data:', data)
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
    console.log('addToRecentlyViewed called with productId:', productId)
    console.log('Session user:', session?.user?.email)
    
    if (!session?.user) {
      console.log('No session user, skipping tracking')
      return false
    }

    try {
      console.log('Making POST request to /api/recently-viewed')
      const response = await fetch('/api/recently-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
        cache: 'no-store'
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error('Failed to add to recently viewed')
      }

      // Refresh the list after adding
      await fetchRecentlyViewed()
      return true
    } catch (err) {
      console.error('Add to recently viewed error:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to recently viewed')
      return false
    }
  }

  useEffect(() => {
    console.log('useRecentlyViewed useEffect triggered, session status:', session?.user?.email)
    if (session?.user) {
      fetchRecentlyViewed()
    } else {
      console.log('No session in useEffect, setting empty items')
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
