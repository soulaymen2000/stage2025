import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from './service.model';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private baseUrl = '/api/services';

  constructor(private http: HttpClient) {}

  getServices(params?: any): Observable<Service[]> {
    return this.http.get<Service[]>(this.baseUrl, { params });
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
} 