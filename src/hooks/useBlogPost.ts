import { useState, useEffect } from 'react'

export interface BlogPost {
  id: string
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

export const useBlogPost = (slug: string) => {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('No slug provided')
      setLoading(false)
      return
    }

    const fetchBlogPost = async () => {
      try {
        console.log('useBlogPost: Fetching blog post for slug:', slug)
        const response = await fetch(`/api/blog/${slug}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('useBlogPost: API response error:', errorData)
          setError(errorData.error || 'Failed to fetch blog post')
          return
        }
        
        const data = await response.json()
        console.log('useBlogPost: Successfully fetched blog post:', data.blogPost?.title)
        setBlogPost(data.blogPost)
      } catch (error) {
        console.error('useBlogPost: Failed to fetch blog post:', error)
        setError('Failed to fetch blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [slug])

  return { blogPost, loading, error }
}
