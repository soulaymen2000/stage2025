import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReviewApiService {
  private baseUrl = '/api/reviews';
  constructor(private http: HttpClient) {}
  createReview(review: any): Observable<any> {
    return this.http.post(this.baseUrl, review);
  }
  getAllReviews(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
} 