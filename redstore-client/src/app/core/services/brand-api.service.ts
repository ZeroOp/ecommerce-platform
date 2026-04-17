import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BrandApiResponse {
  id: string;
  name: string;
  website?: string | null;
  description: string;
  sellerId: string;
  status: string;
  logo?: string | null;
  logoUrl?: string | null;
  categoryIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBrandPayload {
  name: string;
  website?: string;
  description: string;
  logo?: string;
  categoryIds?: string[];
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class BrandApiService {
  private http = inject(HttpClient);

  getMyBrands(): Observable<BrandApiResponse[]> {
    return this.http.get<BrandApiResponse[]>('/api/brands/my');
  }

  /** Admin / catalog: optional status filter e.g. PENDING, APPROVED, SUSPENDED, REJECTED */
  getAllBrands(params?: { status?: string }): Observable<BrandApiResponse[]> {
    const q: Record<string, string> = {};
    if (params?.status) {
      q['status'] = params.status;
    }
    return this.http.get<BrandApiResponse[]>('/api/brands', { params: q });
  }

  patchBrandStatus(brandId: string, status: string): Observable<BrandApiResponse> {
    return this.http.patch<BrandApiResponse>(`/api/brands/${encodeURIComponent(brandId)}/status`, { status });
  }

  createBrand(payload: CreateBrandPayload): Observable<BrandApiResponse> {
    return this.http.post<BrandApiResponse>('/api/brands', payload);
  }

  createLogoUploadUrl(fileName: string, contentType: string): Observable<PresignedUploadResponse> {
    return this.http.post<PresignedUploadResponse>('/api/brands/logo/presigned-upload', {
      fileName,
      contentType,
    });
  }

  uploadLogoToPresignedUrl(uploadUrl: string, file: File): Observable<unknown> {
    return this.http.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
  }
}
