import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminSellerRow {
  email: string;
  active: boolean;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class AdminSellerApiService {
  private http = inject(HttpClient);

  listSellers(): Observable<AdminSellerRow[]> {
    return this.http.get<AdminSellerRow[]>('/api/admin/sellers');
  }

  setSellerActive(email: string, active: boolean): Observable<AdminSellerRow> {
    return this.http.patch<AdminSellerRow>('/api/admin/sellers/active', { email, active });
  }
}
