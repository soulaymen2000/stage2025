import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservationApiService {
  private baseUrl = '/api/reservations';
  constructor(private http: HttpClient) {}
  createReservation(reservation: any): Observable<any> {
    return this.http.post(this.baseUrl, reservation);
  }
  getMyReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + '/my');
  }
} 