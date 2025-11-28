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
    reservationId: string; // Keep as string for frontend consistency
    serviceName: string;
    clientName: string;
    clientId: string;
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

    // Add method to update reservation status
    updateReservationStatus(reservationId: string, status: string): Observable<any> {
        console.log(`Calling PUT ${this.baseUrl}/reservations/${reservationId}/status with status: ${status}`);
        // Convert reservationId to number for the API call
        const numericId = Number(reservationId);
        if (isNaN(numericId)) {
            console.error('Invalid reservation ID:', reservationId);
            throw new Error('Invalid reservation ID');
        }
        return this.http.put(`${this.baseUrl}/reservations/${numericId}/status`, { status });
    }
}