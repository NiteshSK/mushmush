export type Product = {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  measurementValue: number;
  measurementType: string;
  quantity?: number;
  stockQuantity?: number;
  inStock: boolean;
  featured: boolean;
  isOutOfStock?: boolean;
  hasDiscount?: boolean;
  discountPercentage?: number;
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
  reviewsList?: {
    name: string;
    role?: string;
    rating: number;
    comment: string;
    avatar?: string;
  }[];
  measurement?: {
    value: number;
    type: string;
  };
  benefits?: any;
};
