export interface PromotionalBanner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: string;
  buttonText: string;
  buttonLink?: string;
  productId?: number;
  categoryId?: number;
  imageUrl: string;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: number;
    title: string;
    slug: string;
    price: number;
    imgs: any;
    inStock: boolean;
  };
  category?: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface PromotionalBannerResponse {
  success: boolean;
  data: PromotionalBanner[];
  error?: string;
}
