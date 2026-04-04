import { useState, useEffect } from 'react'

export interface BlogPost {
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
}

export interface BlogPostsResponse {
  posts: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useBlogPosts = (page: number = 1, limit: number = 6, published: boolean = true) => {
  const [data, setData] = useState<BlogPostsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          published: published.toString()
        })
        
        const response = await fetch(`/api/blog?${params}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('useBlogPosts: API response error:', errorData)
          setError(errorData.error || 'Failed to fetch blog posts')
          return
        }
        
        const responseData = await response.json()
        setData(responseData)
      } catch (error) {
        console.error('useBlogPosts: Failed to fetch blog posts:', error)
        setError('Failed to fetch blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [page, limit, published])

  return { data, loading, error }
}
