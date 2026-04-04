import { useEffect } from 'react'

export const useNewsViews = (slug: string) => {
  useEffect(() => {
    const incrementViews = async () => {
      if (!slug) return
      
      try {
        // The view increment is handled by the API when fetching the news post
        // This hook is here for consistency with the blog system
      } catch (error) {
        console.error('Error tracking views:', error)
      }
    }

    incrementViews()
  }, [slug])
}
