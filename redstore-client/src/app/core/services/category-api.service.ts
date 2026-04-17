import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoryApiResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parentCategoryId?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private http = inject(HttpClient);

  getCategories(): Observable<CategoryApiResponse[]> {
    return this.http.get<CategoryApiResponse[]>('/api/categories');
  }

  getCategoryById(categoryId: string): Observable<CategoryApiResponse> {
    return this.http.get<CategoryApiResponse>(`/api/categories/${categoryId}`);
  }

  createCategory(payload: CreateCategoryPayload): Observable<CategoryApiResponse> {
    return this.http.post<CategoryApiResponse>('/api/categories', payload);
  }

  updateCategory(categoryId: string, payload: Partial<CreateCategoryPayload>): Observable<CategoryApiResponse> {
    return this.http.put<CategoryApiResponse>(`/api/categories/${categoryId}`, payload);
  }

  deleteCategory(categoryId: string): Observable<void> {
    return this.http.delete<void>(`/api/categories/${categoryId}`);
  }

  createIconUploadUrl(fileName: string, contentType: string): Observable<PresignedUploadResponse> {
    return this.http.post<PresignedUploadResponse>('/api/categories/icon/presigned-upload', {
      fileName,
      contentType,
    });
  }

  uploadIconToPresignedUrl(uploadUrl: string, file: File): Observable<unknown> {
    return this.http.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
  }
}
