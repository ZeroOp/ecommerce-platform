import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentApi {
  paymentId: string;
  orderId: string;
  status: 'AWAITING_PAYMENT' | 'PAID' | 'EXPIRED';
  amount: number;
  currency: string;
  provider: string;
  providerRef?: string;
  orderExpiresAt?: string;
  paidAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private http = inject(HttpClient);
  private readonly base = '/api/payments';

  byOrder(orderId: string): Observable<PaymentApi> {
    return this.http.get<PaymentApi>(`${this.base}/orders/${encodeURIComponent(orderId)}`, { withCredentials: true });
  }

  confirm(orderId: string, method = 'card'): Observable<PaymentApi> {
    return this.http.post<PaymentApi>(
      `${this.base}/orders/${encodeURIComponent(orderId)}/confirm`,
      { method },
      { withCredentials: true },
    );
  }
}
