import { Component, OnInit } from '@angular/core';
import { ReservationApiService } from '../../../services/reservation-api.service';
import { ServiceApiService } from '../../../services/service-api.service';
import { ReviewApiService } from '../../../services/review-api.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard-client',
  standalone: false,
  templateUrl: './dashboard-client.component.html',
  styleUrls: ['./dashboard-client.component.scss']
})
export class DashboardClientComponent implements OnInit {
  reservations: any[] = [];
  services: { [id: string]: any } = {};
  reviews: { [serviceId: string]: any } = {};
  loading = true;
  recommendations: any[] = [];
  loadingRecommendations = true;
  errorRecommendations: string | null = null;

  constructor(
    private reservationApi: ReservationApiService,
    private serviceApi: ServiceApiService,
    private reviewApi: ReviewApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.reservationApi.getMyReservations().subscribe(reservations => {
      console.log('API reservations:', reservations);
      this.reservations = reservations;
      this.cdr.detectChanges();
      const serviceIds = reservations.map(r => r.serviceId);
      this.serviceApi.getServices().subscribe(allServices => {
        for (const s of allServices) {
          if (s.id) {
            this.services[s.id] = s;
          }
        }
        this.cdr.detectChanges();
        this.loadReviews(serviceIds);
      }, () => { this.loading = false; this.cdr.detectChanges(); });
      if (!serviceIds.length) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, () => { this.loading = false; this.cdr.detectChanges(); });

    // Fetch personalized recommendations
    this.serviceApi.getPersonalizedRecommendations().subscribe({
      next: (recs) => {
        this.recommendations = recs;
        this.loadingRecommendations = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorRecommendations = 'Erreur lors du chargement des recommandations.';
        this.loadingRecommendations = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadReviews(serviceIds: string[]) {
    this.reviewApi.getAllReviews().subscribe(allReviews => {
      for (const r of allReviews) {
        if (serviceIds.includes(r.serviceId)) {
          this.reviews[r.serviceId] = r;
        }
      }
      this.loading = false;
      this.cdr.detectChanges();
      console.log('Reservations:', this.reservations.length, 'Services:', Object.keys(this.services).length, 'Reviews:', Object.keys(this.reviews).length);
    }, () => { this.loading = false; this.cdr.detectChanges(); });
  }
}
