import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces for the DTOs to have strong typing
export interface StatsDto {
    totalRevenue: number;
    totalReservations: number;
    averageRating: number;
}

export interface ReservationDetailDto {
    reservationId: string;
    serviceName: string;
    clientName: string;
    reservationDate: string; // Comes as string from JSON
    status: string;
    price: number;
}

@Injectable({
    providedIn: 'root'
})
export class FournisseurApiService {
    private baseUrl = '/api/fournisseur';

    constructor(private http: HttpClient) {}

    getStats(): Observable<StatsDto> {
        return this.http.get<StatsDto>(`${this.baseUrl}/stats`);
    }

    getReservations(): Observable<ReservationDetailDto[]> {
        return this.http.get<ReservationDetailDto[]>(`${this.baseUrl}/reservations`);
    }
} 