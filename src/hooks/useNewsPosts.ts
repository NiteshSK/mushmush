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
  tags?: { id: number; name: string; slug: string }[]
}

export interface NewsPostsResponse {
  news: NewsPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const useNewsPosts = (page: number = 1, limit: number = 6, published: boolean = true) => {
  const [data, setData] = useState<NewsPostsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNewsPosts = async () => {
      try {
        console.log('useNewsPosts: Fetching news posts...')
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        })
        
        const response = await fetch(`/api/news?${params}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('useNewsPosts: API response error:', errorData)
          setError(errorData.error || 'Failed to fetch news posts')
          return
        }
        
        const responseData = await response.json()
        console.log('useNewsPosts: Successfully fetched news posts:', responseData.news?.length)
        setData(responseData)
      } catch (error) {
        console.error('useNewsPosts: Failed to fetch news posts:', error)
        setError('Failed to fetch news posts')
      } finally {
        setLoading(false)
      }
    }

    fetchNewsPosts()
  }, [page, limit, published])

  return { data, loading, error }
}
