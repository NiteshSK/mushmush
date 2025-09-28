import { useEffect } from 'react'

export const useNewsViews = (slug: string) => {
  useEffect(() => {
    const incrementViews = async () => {
      if (!slug) return
      
      try {
        // The view increment is handled by the API when fetching the news post
        // This hook is here for consistency with the blog system
        console.log('useNewsViews: View tracking handled by API')
      } catch (error) {
        console.error('useNewsViews: Error tracking views:', error)
      }
    }

    incrementViews()
  }, [slug])
}
