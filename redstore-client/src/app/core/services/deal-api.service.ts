import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export type DealScope = 'SELLER' | 'PRODUCT' | 'BRAND' | 'CATEGORY';

export interface DealDto {
  id: string;
  sellerId: string;
  scope: DealScope;
  targetId?: string | null;
  discountPercentage: number;
  title: string;
  startsAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
}

export interface CreateDealPayload {
  scope: DealScope;
  productId?: string;
  brandId?: string;
  categoryId?: string;
  discountPercentage: number;
  title: string;
  startsAt?: string;
  expiresAt: string;
}

export interface BestDealResponse {
  productId: string;
  dealId: string;
  scope: DealScope;
  discountPercentage: number;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class DealApiService {
  private http = inject(HttpClient);

  createDeal(payload: CreateDealPayload): Observable<DealDto> {
    return this.http.post<DealDto>('/api/deals', payload);
  }

  listMyDeals(): Observable<DealDto[]> {
    return this.http.get<DealDto[]>('/api/deals/my');
  }

  cancelDeal(dealId: string): Observable<DealDto> {
    return this.http.post<DealDto>(`/api/deals/${encodeURIComponent(dealId)}/cancel`, {});
  }

  bestByProducts(productIds: string[]): Observable<BestDealResponse[]> {
    let params = new HttpParams();
    for (const id of productIds) {
      params = params.append('productIds', id);
    }
    return this.http.get<BestDealResponse[]>('/api/deals/public/best-by-products', { params });
  }
}

export function applyBestDeals(products: Product[], deals: BestDealResponse[]): Product[] {
  const byProduct = new Map(deals.map((d) => [d.productId, d]));
  return products.map((p) => {
    const d = byProduct.get(p.id);
    if (!d || !(d.discountPercentage > 0)) return p;
    const original = Number(p.originalPrice ?? p.price ?? 0);
    const discounted = Math.max(0, original - (original * Number(d.discountPercentage)) / 100);
    return {
      ...p,
      originalPrice: Number(original.toFixed(2)),
      price: Number(discounted.toFixed(2)),
      discount: Number(d.discountPercentage),
      badge: p.badge ?? 'Deal',
    };
  });
}
