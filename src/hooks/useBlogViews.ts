import { useEffect, useRef } from 'react'

export const useBlogViews = (slug: string) => {
  const incrementTimeout = useRef<NodeJS.Timeout | null>(null)
  const isProcessing = useRef(false)
  
  useEffect(() => {
    if (!slug) {
      return
    }

    // Clear any existing timeout to prevent race conditions
    if (incrementTimeout.current) {
      clearTimeout(incrementTimeout.current)
    }

    // Prevent multiple rapid increments
    if (isProcessing.current) {
      return
    }

    const incrementViews = async () => {
      if (isProcessing.current) return
      
      isProcessing.current = true

      try {
        const response = await fetch(`/api/blog/${slug}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          return
        }

        await response.json()
      } catch (error) {
        console.error('Failed to increment blog views:', error)
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
