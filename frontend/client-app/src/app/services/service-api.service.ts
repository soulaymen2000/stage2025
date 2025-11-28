import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from './service.model';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private baseUrl = '/api/services';

  constructor(private http: HttpClient) {}

  /**
   * params: simple key/value filter map used for query params.
   */
  getServices(params?: Record<string, string | number | null>): Observable<Service[]> {
    const safeParams: any = {};
    if (params) {
      for (const k of Object.keys(params)) {
        const v = params[k as keyof typeof params];
        if (v != null) safeParams[k] = String(v);
      }
    }
    return this.http.get<Service[]>(this.baseUrl, { params: safeParams });
  }

  getService(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/${id}`);
  }

  createService(service: Service): Observable<Service> {
    return this.http.post<Service>(this.baseUrl, service);
  }

  updateService(id: string, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.baseUrl}/${id}`, service);
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSimilarServices(id: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/${id}/similar`);
  }

  getPersonalizedRecommendations(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/recommendations`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }
}