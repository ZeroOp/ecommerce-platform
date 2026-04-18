import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface InventoryLineApiResponse {
  productId: string;
  sellerId: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private http = inject(HttpClient);

  getSellerInventory(): Observable<InventoryLineApiResponse[]> {
    return this.http.get<InventoryLineApiResponse[]>('/api/inventory/seller');
  }

  addStock(productId: string, quantity: number): Observable<InventoryLineApiResponse> {
    return this.http.post<InventoryLineApiResponse>(
      `/api/inventory/seller/products/${encodeURIComponent(productId)}/add-stock`,
      { quantity },
    );
  }

  getPublicQuantity(productId: string): Observable<{ productId: string; quantityAvailable: number }> {
    return this.http.get<{ productId: string; quantityAvailable: number }>(
      `/api/inventory/public/products/${encodeURIComponent(productId)}/quantity`,
    );
  }

  /**
   * Batch quantity lookup for a list of product IDs.
   * Returns a map of productId → availableQuantity.
   */
  getBatchQuantities(productIds: string[]): Observable<Record<string, number>> {
    if (productIds.length === 0) {
      return of({});
    }
    const params = new HttpParams().set('productIds', productIds.join(','));
    return this.http.get<Record<string, number>>('/api/inventory/public/quantities', { params });
  }
}
