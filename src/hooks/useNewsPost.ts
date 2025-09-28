import { useState, useEffect } from 'react'

export interface NewsPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  img?: string
  views: number
  published: boolean
  createdAt: string
  updatedAt: string
  metaTitle?: string
  metaDescription?: string
  tags?: { id: number; name: string; slug: string }[]
}

export const useNewsPost = (slug: string) => {
  const [blogPost, setBlogPost] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNewsPost = async () => {
      if (!slug) return
      
      try {
        console.log('useNewsPost: Fetching news post for slug:', slug)
        const response = await fetch(`/api/news/${slug}?incrementViews=true`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('News article not found')
          } else {
            const errorData = await response.json()
            setError(errorData.error || 'Failed to fetch news article')
          }
          return
        }
        
        const data = await response.json()
        console.log('useNewsPost: Successfully fetched news post:', data.title)
        setBlogPost(data)
      } catch (error) {
        console.error('useNewsPost: Failed to fetch news post:', error)
        setError('Failed to fetch news article')
      } finally {
        setLoading(false)
      }
    }

    fetchNewsPost()
  }, [slug])

  return { blogPost, loading, error }
}
