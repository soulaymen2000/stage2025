import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FournisseurApiService, StatsDto, ReservationDetailDto } from '../../../services/fournisseur-api.service';

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

  constructor(
    private fournisseurApi: FournisseurApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadReservations();
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
        this.reservations = data;
        this.loadingReservations = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des réservations.';
        this.loadingReservations = false;
        this.cdr.detectChanges();
      }
    });
  }
}
