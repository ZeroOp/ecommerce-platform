export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  category: string;
  subCategory?: string;
  brand: string;
  inStock: boolean;
  stockCount?: number;
  badge?: string;
  tags?: string[];
  specs?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  description: string;
  color: string;
  subCategories: { name: string; slug: string; image: string }[];
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  categories: string[];
  productCount: number;
  rating: number;
  status?: 'active' | 'pending' | 'suspended';
}
