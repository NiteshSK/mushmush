// API utility functions for client-side data fetching

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  measurementValue: number;
  measurementType: string;
  inStock: boolean;
  featured: boolean;
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
  specifications: string[];
  howToConsume: string[];
  additionalInfo: { label: string; value: string }[];
  categories: { category: { id: number; title: string; slug: string } }[];
  averageRating?: number;
  reviewCount?: number;
  reviews?: number; // For backward compatibility
  category?: string[]; // For backward compatibility
  measurement?: {
    value: number;
    type: string;
  };
}

export interface Category {
  id: number
  title: string
  slug: string
  img: string
  path: string
  description?: string
  productCount?: number
  inStockCount?: number
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  img: string
  views: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  createdAt: string
  customerName: string
  customerEmail: string
  orderItems: {
    id: number
    quantity: number
    price: number
    product: {
      id: number
      title: string
      imgs: any
    }
  }[]
}

// Products API
export const productsApi = {
  getAll: async (params?: {
    category?: string
    featured?: boolean
    inStock?: boolean
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.featured) searchParams.set('featured', 'true')
    if (params?.inStock) searchParams.set('inStock', 'true')
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/products?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
  },

  getById: async (id: number): Promise<Product> => {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    return response.json()
  },

  create: async (product: Omit<Product, 'id' | 'slug' | 'averageRating' | 'reviewCount'>) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
    if (!response.ok) throw new Error('Failed to create product')
    return response.json()
  },

  update: async (id: number, product: Partial<Product>) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
    if (!response.ok) throw new Error('Failed to update product')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete product')
    return response.json()
  }
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetch('/api/categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  create: async (category: Omit<Category, 'id' | 'slug' | 'productCount' | 'inStockCount'>) => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    })
    if (!response.ok) throw new Error('Failed to create category')
    return response.json()
  }
}

// Blog API
export const blogApi = {
  getAll: async (params?: {
    published?: boolean
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.published) searchParams.set('published', 'true')
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/blog?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch blog posts')
    return response.json()
  },

  create: async (post: Omit<BlogPost, 'id' | 'slug' | 'views' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    })
    if (!response.ok) throw new Error('Failed to create blog post')
    return response.json()
  }
}

// Orders API
export const ordersApi = {
  getAll: async (params?: {
    userId?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.userId) searchParams.set('userId', params.userId)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/orders?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch orders')
    return response.json()
  },

  create: async (order: {
    userId?: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    shippingAddress: any
    orderItems: { productId: number; quantity: number; price: number }[]
    subtotal: number
    tax: number
    shipping: number
  }) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
    if (!response.ok) throw new Error('Failed to create order')
    return response.json()
  }
}
