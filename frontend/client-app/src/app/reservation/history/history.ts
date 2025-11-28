import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationApiService } from '../../services/reservation-api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Reservation } from '../../shared/api-models';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    ChatComponent
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class History implements OnInit {
  reservations: Reservation[] = [];
  selectedReservation: Reservation | null = null;
  currentUserId: number | null = null;
  otherUserId: number | null = null;
  showChat = false;
  loading = true;

  constructor(
    private reservationApi: ReservationApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadReservations();
  }

  loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Extract user ID from token if available
        this.currentUserId = payload.userId || payload.id || 1;
      } catch (e) {
        console.error('Error parsing token:', e);
        this.currentUserId = 1; // Default fallback
      }
    }
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationApi.getMyReservations().subscribe({
      next: (data) => {
        console.log('Reservations loaded:', data);
        console.log('Reservations count:', data.length);
        this.reservations = data;
        this.loading = false;
        console.log('this.reservations:', this.reservations);
        console.log('this.reservations.length:', this.reservations.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.loading = false;
        alert('Erreur lors du chargement des réservations. Vérifiez la console.');
      }
    });
  }

  openChat(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showChat = true;
    
    // Determine the other user (fournisseur or client)
    // If current user is the client, then other user is the fournisseur (service.ownerId)
    if (reservation.service && reservation.service.ownerId) {
      this.otherUserId = parseInt(reservation.service.ownerId.toString());
    } else {
      // Fallback - you might want to fetch this from the backend
      this.otherUserId = 2; // Replace with actual logic to get the other user's ID
    }
  }

  closeChat(): void {
    this.showChat = false;
    this.selectedReservation = null;
  }
}
