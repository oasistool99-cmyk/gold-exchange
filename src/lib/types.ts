export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail_url: string;
  category_id: number | null;
  tags: string[];
  published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface GoldPrice {
  name: string;
  buy: number;
  sell: number;
  change: number;
}
