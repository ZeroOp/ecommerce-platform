import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface ProductApiResponse {
  id: string;
  sellerId: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categorySlug?: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrls: string[];
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  brandId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageKeys: string[];
  metadata: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private http = inject(HttpClient);

  getProducts(params?: { categoryId?: string; categorySlug?: string; limit?: number }): Observable<ProductApiResponse[]> {
    let hp = new HttpParams();
    if (params?.categoryId) {
      hp = hp.set('categoryId', params.categoryId);
    }
    if (params?.categorySlug) {
      hp = hp.set('categorySlug', params.categorySlug);
    }
    if (params?.limit != null) {
      hp = hp.set('limit', String(params.limit));
    }
    return this.http.get<ProductApiResponse[]>('/api/products', { params: hp });
  }

  getProductById(productId: string): Observable<ProductApiResponse> {
    return this.http.get<ProductApiResponse>(`/api/products/${encodeURIComponent(productId)}`);
  }

  /** Seller catalog (includes products whose brand is not yet approved). */
  getMyProducts(): Observable<ProductApiResponse[]> {
    return this.http.get<ProductApiResponse[]>('/api/seller/products');
  }

  createProduct(payload: CreateProductPayload): Observable<ProductApiResponse> {
    return this.http.post<ProductApiResponse>('/api/seller/products', payload);
  }

  createImageUploadUrl(fileName: string, contentType: string): Observable<{
    uploadUrl: string;
    objectKey: string;
    expiresAt: string;
  }> {
    return this.http.post<{ uploadUrl: string; objectKey: string; expiresAt: string }>(
      '/api/seller/products/images/presigned-upload',
      { fileName, contentType },
    );
  }

  uploadImageToPresignedUrl(uploadUrl: string, file: File): Observable<unknown> {
    return this.http.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
  }
}

export function mapProductApiToModel(p: ProductApiResponse): Product {
  const primary = p.imageUrls?.[0] ?? '';
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    rating: 0,
    reviews: 0,
    image: primary,
    images: p.imageUrls,
    category: p.categoryName,
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    brand: p.brandName,
    inStock: true,
    specs: p.metadata,
  };
}
