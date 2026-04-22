import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateOrderItemPayload {
  productId: string;
  sellerId?: string;
  name?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
}

export interface OrderItemApi {
  productId: string;
  sellerId?: string;
  name?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderApi {
  id: string;
  userId: string;
  userEmail: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  subtotal: number;
  items: OrderItemApi[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  cancellationReason?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private http = inject(HttpClient);
  private readonly base = '/api/orders';

  listMine(): Observable<OrderApi[]> {
    return this.http.get<OrderApi[]>(this.base, { withCredentials: true });
  }

  getMine(orderId: string): Observable<OrderApi> {
    return this.http.get<OrderApi>(`${this.base}/${encodeURIComponent(orderId)}`, { withCredentials: true });
  }

  create(payload: CreateOrderPayload): Observable<OrderApi> {
    return this.http.post<OrderApi>(this.base, payload, { withCredentials: true });
  }

  listSeller(): Observable<OrderApi[]> {
    return this.http.get<OrderApi[]>(`${this.base}/seller`, { withCredentials: true });
  }

  listAdmin(): Observable<OrderApi[]> {
    return this.http.get<OrderApi[]>(`${this.base}/admin`, { withCredentials: true });
  }

  sellerShip(orderId: string): Observable<OrderApi> {
    return this.http.post<OrderApi>(`${this.base}/${encodeURIComponent(orderId)}/seller/ship`, {}, { withCredentials: true });
  }

  sellerCancel(orderId: string, reason?: string): Observable<OrderApi> {
    const q = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return this.http.post<OrderApi>(`${this.base}/${encodeURIComponent(orderId)}/seller/cancel${q}`, {}, { withCredentials: true });
  }

  adminClose(orderId: string): Observable<OrderApi> {
    return this.http.post<OrderApi>(`${this.base}/${encodeURIComponent(orderId)}/admin/close`, {}, { withCredentials: true });
  }

  adminCancel(orderId: string, reason?: string): Observable<OrderApi> {
    const q = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return this.http.post<OrderApi>(`${this.base}/${encodeURIComponent(orderId)}/admin/cancel${q}`, {}, { withCredentials: true });
  }
}
