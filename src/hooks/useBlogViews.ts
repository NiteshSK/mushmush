import { useEffect, useRef } from 'react'

export const useBlogViews = (slug: string) => {
  const incrementTimeout = useRef<NodeJS.Timeout | null>(null)
  const isProcessing = useRef(false)
  
  useEffect(() => {
    if (!slug) {
      console.log('useBlogViews: No slug provided')
      return
    }

    // Clear any existing timeout to prevent race conditions
    if (incrementTimeout.current) {
      clearTimeout(incrementTimeout.current)
    }

    // Prevent multiple rapid increments
    if (isProcessing.current) {
      console.log('useBlogViews: Already processing increment, skipping')
      return
    }

    const incrementViews = async () => {
      if (isProcessing.current) return
      
      isProcessing.current = true
      console.log('useBlogViews: Incrementing views for slug:', slug)
      
      try {
        const response = await fetch(`/api/blog/${slug}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('useBlogViews: API response error:', errorData)
          return
        }
        
        const data = await response.json()
        console.log('useBlogViews: Successfully incremented views:', data)
      } catch (error) {
        console.error('useBlogViews: Failed to increment blog views:', error)
      } finally {
        // Reset processing state after a delay to prevent double increments
        incrementTimeout.current = setTimeout(() => {
          isProcessing.current = false
        }, 1000) // 1 second delay
      }
    }

    // Add a small delay to handle React strict mode double mounting
    incrementTimeout.current = setTimeout(() => {
      incrementViews()
    }, 100)

    // Cleanup function
    return () => {
      if (incrementTimeout.current) {
        clearTimeout(incrementTimeout.current)
      }
    }
  }, [slug])
}
