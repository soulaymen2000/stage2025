import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FournisseurApiService, StatsDto, ReservationDetailDto } from '../../../services/fournisseur-api.service';
import { MessagingService } from '../../../services/messaging.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard-fournisseur',
  standalone: false,
  templateUrl: './dashboard-fournisseur.component.html',
  styleUrls: ['./dashboard-fournisseur.component.scss']
})
export class DashboardFournisseurComponent implements OnInit {
  stats: StatsDto | null = null;
  reservations: ReservationDetailDto[] = [];
  loadingStats = true;
  loadingReservations = true;
  error: string | null = null;
  currentUserId: number | null = null;

  constructor(
    private fournisseurApi: FournisseurApiService,
    private messagingService: MessagingService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadStats();
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

  loadStats(): void {
    this.loadingStats = true;
    this.fournisseurApi.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadingStats = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error = 'Erreur lors du chargement des statistiques.';
        this.loadingStats = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadReservations(): void {
    this.loadingReservations = true;
    this.fournisseurApi.getReservations().subscribe({
      next: (data) => {
        console.log('Reservations loaded:', data);
        this.reservations = data;
        this.loadingReservations = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.error = 'Erreur lors du chargement des réservations.';
        this.loadingReservations = false;
        this.cdr.detectChanges();
      }
    });
  }

  openChat(reservation: ReservationDetailDto): void {
    if (this.currentUserId && reservation.clientId) {
      // Open chat with the client
      const clientId = parseInt(reservation.clientId);
      console.log(`Opening chat for reservation ${reservation.reservationId} between fournisseur ${this.currentUserId} and client ${clientId}`);
      
      // Here you would typically open a chat modal or navigate to a chat page
      // For now, we'll just log the action
      alert(`Chat would open with client ${reservation.clientName} for reservation ${reservation.reservationId}`);
    }
  }

  // Add method to update reservation status
  updateReservationStatus(reservationId: string, newStatus: string): void {
    console.log(`Updating reservation ${reservationId} to status ${newStatus}`);
    this.fournisseurApi.updateReservationStatus(reservationId, newStatus).subscribe({
      next: (response) => {
        console.log('Reservation status updated successfully:', response);
        // Update the reservation status in the local array
        const reservation = this.reservations.find(r => r.reservationId === reservationId);
        if (reservation) {
          reservation.status = newStatus;
        }
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
        // Reload stats since revenue might have changed
        this.loadStats();
      },
      error: (err) => {
        console.error('Error updating reservation status:', err);
        this.snackBar.open('Erreur lors de la mise à jour du statut: ' + (err.message || 'Unknown error'), 'Fermer', { duration: 5000 });
      }
    });
  }

  // Handle status change event
  onStatusChange(reservationId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;
    console.log(`Status change event for reservation ${reservationId}: ${newStatus}`);
    this.updateReservationStatus(reservationId, newStatus);
  }
}