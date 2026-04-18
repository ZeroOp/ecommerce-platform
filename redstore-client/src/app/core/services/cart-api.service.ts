import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItemApiResponse {
  productId: string;
  quantity: number;
  name?: string;
  brand?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  slug?: string;
  availableQuantity?: number;
  addedAt?: string;
}

export interface CartApiResponse {
  userId: string;
  items: CartItemApiResponse[];
  totalItems: number;
  subtotal: number;
}

export interface AddItemPayload {
  productId: string;
  quantity: number;
  name?: string;
  brand?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  slug?: string;
}

export interface CheckoutIssue {
  productId: string;
  name?: string;
  requested: number;
  available: number;
  reason: string;
}

export interface CheckoutResult {
  ok: boolean;
  orderRef?: string;
  issues: CheckoutIssue[];
  cart: CartApiResponse;
}

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private http = inject(HttpClient);
  private readonly base = '/api/cart';

  getCart(): Observable<CartApiResponse> {
    return this.http.get<CartApiResponse>(this.base, { withCredentials: true });
  }

  addItem(payload: AddItemPayload): Observable<CartApiResponse> {
    return this.http.post<CartApiResponse>(`${this.base}/items`, payload, { withCredentials: true });
  }

  updateQuantity(productId: string, quantity: number): Observable<CartApiResponse> {
    return this.http.patch<CartApiResponse>(
      `${this.base}/items/${encodeURIComponent(productId)}`,
      { quantity },
      { withCredentials: true },
    );
  }

  removeItem(productId: string): Observable<CartApiResponse> {
    return this.http.delete<CartApiResponse>(
      `${this.base}/items/${encodeURIComponent(productId)}`,
      { withCredentials: true },
    );
  }

  clear(): Observable<CartApiResponse> {
    return this.http.delete<CartApiResponse>(this.base, { withCredentials: true });
  }

  checkout(dryRun = false): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(
      `${this.base}/checkout`,
      { dryRun },
      { withCredentials: true },
    );
  }
}
