export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  category?: string[];
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  description: string;
  specifications: string[];
  howToConsume: string[];
  additionalInfo?: { label: string; value: string }[];
  reviewsList?: {
    name: string;
    role?: string;
    rating: number; // 1-5
    comment: string;
    avatar?: string;
  }[];
  inStock?: boolean;
  measurement?: {
    value: number;
    type: string;
  };
};
