import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blogs | MushMush',
  description: 'Read our latest blog posts on MushMush',
}

export default function BlogDetailsRedirectPage() {
  // Redirect to the main blogs page since individual blog posts
  // are now handled by the dynamic route: /blogs/[slug]
  redirect('/blogs')
}
