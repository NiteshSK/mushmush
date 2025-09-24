import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlogDetails from '@/components/BlogDetails'
import FestiveWrapper from '@/components/FestiveWrapper'
import { prisma } from '@/lib/prisma'

interface BlogDetailsPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (!blogPost) {
      return {
        title: 'Blog Not Found | MushMush',
        description: 'The requested blog post could not be found.'
      }
    }

    return {
      title: `${blogPost.title} | MushMush`,
      description: blogPost.excerpt || 'Read this blog post on MushMush',
      // other metadata
    }
  } catch (error) {
    return {
      title: 'Blog Details | MushMush',
      description: 'Read our latest blog posts on MushMush'
    }
  }
}

export default async function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  const { slug } = await params
  
  try {
    // Verify blog post exists
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (!blogPost) {
      notFound()
    }

    return (
      <main>
        <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={40} mushroomCount={25}>
          <BlogDetails slug={slug} />
        </FestiveWrapper>
      </main>
    )
  } catch (error) {
    console.error('Error fetching blog post:', error)
    notFound()
  }
}
