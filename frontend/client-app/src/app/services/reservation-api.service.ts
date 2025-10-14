import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationCreate } from '../shared/api-models';

@Injectable({ providedIn: 'root' })
export class ReservationApiService {
  private baseUrl = '/api/reservations';
  constructor(private http: HttpClient) {}
  createReservation(reservation: ReservationCreate): Observable<Reservation> {
    // Normalize payload to server expected shape
    const payload: any = ('serviceId' in reservation) ? { service: { id: reservation.serviceId } } : reservation;
    return this.http.post<Reservation>(this.baseUrl, payload);
  }
  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.baseUrl + '/my');
  }
} 