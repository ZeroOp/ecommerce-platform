import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsSummaryApi {
  totalOrders: number;
  pendingCount: number;
  inProgressCount: number;
  shippedCount: number;
  completedCount: number;
  cancelledCount: number;
  grossRevenue: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private http = inject(HttpClient);
  private readonly base = '/api/analytics';

  sellerSummary(): Observable<AnalyticsSummaryApi> {
    return this.http.get<AnalyticsSummaryApi>(`${this.base}/seller/summary`, { withCredentials: true });
  }

  adminSummary(): Observable<AnalyticsSummaryApi> {
    return this.http.get<AnalyticsSummaryApi>(`${this.base}/admin/summary`, { withCredentials: true });
  }
}
