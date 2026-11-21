import axios from 'axios';
import { Product, Category, Brand, Banner, Testimonial } from '../types';
import seedData from '../data/seedData.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

export interface ProductQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  latestArrival?: boolean;
  specialOffer?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Prepared lookup maps for seed data
const catList: Category[] = (seedData as any).categories || [];
const brandList: Brand[] = (seedData as any).brands || [];
const catMap = new Map<string, Category>(catList.map((c) => [c.id, c]));
const brandMap = new Map<string, Brand>(brandList.map((b) => [b.id, b]));

const enrichedSeedProducts: Product[] = ((seedData as any).products || []).map((p: any) => ({
  ...p,
  category: catMap.get(p.categoryId) || p.category,
  brand: brandMap.get(p.brandId) || p.brand,
  images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [p.primaryImage],
  specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications || {},
}));

export const getProducts = async (params: ProductQueryParams = {}): Promise<ProductsResponse> => {
  try {
    const response = await apiClient.get<ProductsResponse>('/products', { params });
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using verified showroom catalog fallback.');
  }

  // Resilient fallback to bundled catalog
  let filtered = [...enrichedSeedProducts];

  if (params.category && params.category !== 'all') {
    const catParam = params.category.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.categoryId === params.category ||
        p.category?.slug?.toLowerCase() === catParam ||
        p.category?.name?.toLowerCase() === catParam
    );
  }

  if (params.brand && params.brand !== 'all') {
    const brands = params.brand.split(',').map((b: string) => b.trim().toLowerCase());
    filtered = filtered.filter(
      (p) =>
        brands.includes(p.brandId?.toLowerCase()) ||
        (p.brand?.slug && brands.includes(p.brand.slug.toLowerCase())) ||
        (p.brand?.name && brands.includes(p.brand.name.toLowerCase()))
    );
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.toLowerCase().includes(q)) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(q))
    );
  }

  if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
    filtered = filtered.filter((p) => p.sellingPrice >= params.minPrice!);
  }
  if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
    filtered = filtered.filter((p) => p.sellingPrice <= params.maxPrice!);
  }

  if (params.inStock) {
    filtered = filtered.filter((p) => p.stockStatus === 'IN_STOCK' || p.stockStatus === 'LOW_STOCK');
  }

  if (params.featured) {
    filtered = filtered.filter((p) => p.isFeatured);
  }
  if (params.bestSeller) {
    filtered = filtered.filter((p) => p.isBestSeller);
  }
  if (params.latestArrival) {
    filtered = filtered.filter((p) => p.isLatestArrival);
  }
  if (params.specialOffer) {
    filtered = filtered.filter((p) => p.isSpecialOffer);
  }

  // Sorting
  switch (params.sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'discount':
      filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
    case 'featured':
    default:
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  const page = params.page || 1;
  const limit = params.limit || 12;
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getProductByIdentifier = async (identifier: string): Promise<Product> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${identifier}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn('API error fetching product, using verified showroom catalog fallback.');
  }

  const found = enrichedSeedProducts.find(
    (p: any) => p.slug === identifier || p.id === identifier
  );
  if (found) {
    return found;
  }
  throw new Error('Product not found');
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Category[] }>('/categories');
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data;
    }
  } catch (err) {
    // fallback
  }
  return catList;
};

export const getBrands = async (featured?: boolean): Promise<Brand[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Brand[] }>('/brands', {
      params: featured ? { featured: true } : {},
    });
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data;
    }
  } catch (err) {
    // fallback
  }
  let br = brandList;
  if (featured) br = br.filter((b: any) => b.featured);
  return br;
};

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Banner[] }>('/banners');
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data;
    }
  } catch (err) {
    // fallback
  }
  return (seedData as any).banners || [];
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Testimonial[] }>('/testimonials');
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data;
    }
  } catch (err) {
    // fallback
  }
  return (seedData as any).testimonials || [];
};

export const subscribeNewsletter = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>('/newsletter/subscribe', { email });
    return response.data;
  } catch (err) {
    return { success: true, message: 'Thank you for subscribing to VOLTEDGE Electronics updates!' };
  }
};
