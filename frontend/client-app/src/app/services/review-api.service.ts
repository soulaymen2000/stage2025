import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewCreate } from '../shared/api-models';

@Injectable({ providedIn: 'root' })
export class ReviewApiService {
  private baseUrl = '/api/reviews';
  constructor(private http: HttpClient) {}
  createReview(review: ReviewCreate): Observable<Review> {
    const payload: any = ('serviceId' in review) ? { service: { id: review.serviceId }, rating: review.rating, comment: review.comment } : review;
    return this.http.post<Review>(this.baseUrl, payload);
  }
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl);
  }
  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/my`);
  }
  getReviewsForService(serviceId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/service/${serviceId}`);
  }
} 