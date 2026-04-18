import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';

/** Shape returned by search-service (`GET /api/search/products`). */
export interface ProductSearchHit {
  productId: string;
  sellerId?: string;
  brandId?: string;
  brandName?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  /** Presigned GET URLs minted by search-service. */
  imageUrls?: string[];
  metadata?: Record<string, string>;
  createdAt?: string;
  score?: number;
}

export interface ProductSearchResponse {
  query: string;
  total: number;
  took: number;
  hits: ProductSearchHit[];
}

export interface SearchParams {
  q?: string;
  categoryId?: string;
  /** Multiple categories (e.g. a category + all of its descendants). */
  categoryIds?: string[];
  brandId?: string;
  limit?: number;
}

/**
 * Angular-side view of the OpenSearch-backed search-service. Storefront reads
 * (home, category, deals, search, product-detail) go through this service so
 * the browser never calls product-service on the read path.
 */
@Injectable({ providedIn: 'root' })
export class SearchApiService {
  private http = inject(HttpClient);

  search(params: SearchParams = {}): Observable<ProductSearchResponse> {
    let hp = new HttpParams();
    if (params.q) hp = hp.set('q', params.q);
    if (params.categoryId) hp = hp.set('categoryId', params.categoryId);
    if (params.categoryIds?.length) {
      for (const id of params.categoryIds) {
        hp = hp.append('categoryIds', id);
      }
    }
    if (params.brandId) hp = hp.set('brandId', params.brandId);
    if (params.limit != null) hp = hp.set('limit', String(params.limit));
    return this.http.get<ProductSearchResponse>('/api/search/products', { params: hp });
  }

  /** Convenience for storefront listings — returns just the flattened hits. */
  listProducts(params: SearchParams = {}): Observable<ProductSearchHit[]> {
    return this.search(params).pipe(map((r) => r.hits));
  }

  getById(productId: string): Observable<ProductSearchHit> {
    return this.http.get<ProductSearchHit>(`/api/search/products/${encodeURIComponent(productId)}`);
  }
}

/** Bridge between the search hit and the storefront `Product` model. */
export function mapSearchHitToProduct(hit: ProductSearchHit): Product {
  const images = hit.imageUrls ?? [];
  return {
    id: hit.productId,
    sellerId: hit.sellerId,
    name: hit.name,
    slug: hit.slug ?? hit.productId,
    description: hit.description ?? '',
    price: Number(hit.price ?? 0),
    rating: 0,
    reviews: 0,
    image: images[0] ?? '',
    images,
    category: hit.categoryName ?? '',
    categoryId: hit.categoryId,
    categorySlug: hit.categorySlug,
    brand: hit.brandName ?? '',
    inStock: true,
    specs: hit.metadata ?? {},
  };
}
