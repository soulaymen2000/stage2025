import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReservationApiService } from '../../../services/reservation-api.service';
import { ServiceApiService } from '../../../services/service-api.service';
import { ReviewApiService } from '../../../services/review-api.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, map, tap, catchError } from 'rxjs/operators';
import { Reservation, ServiceModel, Review, Recommendation, ID } from '../../../shared/api-models';

@Component({
  selector: 'app-dashboard-client',
  standalone: false,
  templateUrl: './dashboard-client.component.html',
  styleUrls: ['./dashboard-client.component.scss']
})
export class DashboardClientComponent implements OnInit, OnDestroy {
  // Stronger typing for clarity
  reservations: Reservation[] = [];
  services: Record<string, ServiceModel> = {};
  reviews: Record<string, Review> = {};
  loading = true;
  recommendations: any[] = [];
  loadingRecommendations = true;
  errorRecommendations: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private reservationApi: ReservationApiService,
    private serviceApi: ServiceApiService,
    private reviewApi: ReviewApiService,
    private cdr: ChangeDetectorRef
  ) {}

  isReserved(serviceId: string | number): boolean {
    const key = String(serviceId);
    return this.reservations.some((r: any) => r.service && String(r.service?.id) === key);
  }

  isReviewed(serviceId: string | number): boolean {
    return !!this.reviews[String(serviceId)];
  }

  getReviewFor(serviceId: string | number | null | undefined): Review | undefined {
    if (serviceId == null) return undefined;
    return this.reviews[String(serviceId)];
  }

  ngOnInit(): void {
    // Load reservations -> services (only needed ones) -> reviews (client reviews)
    this.reservationApi.getMyReservations().pipe(
      takeUntil(this.destroy$),
      tap(res => {
        this.reservations = res || [];
      }),
      switchMap(reservations => {
        const serviceIds = (reservations || [])
          .map(r => r.service?.id)
          .filter((id): id is string => id !== undefined && id !== null);

        if (!serviceIds.length) {
          // still try to load reviews to populate any existing ones, but services empty
          return forkJoin({
            services: of([] as ServiceModel[]),
            reviews: this.reviewApi.getMyReviews().pipe(catchError(() => of([] as Review[])))
          });
        }

        // fetch all services once and filter locally (alternatively add API to fetch by ids)
        return forkJoin({
          services: this.serviceApi.getServices().pipe(
            map((all: any[]) => (all || []).filter((s: any) => s && s.id != null && serviceIds.includes(s.id)) as ServiceModel[]),
            catchError(() => of([] as ServiceModel[]))
          ),
          reviews: this.reviewApi.getMyReviews().pipe(catchError(() => of([] as Review[])))
        });
      }),
      catchError(() => {
        // On top-level error return empty result so UI can recover
        return of({ services: [] as ServiceModel[], reviews: [] as Review[] });
      })
    ).subscribe(({ services, reviews }) => {
      // map services
        for (const s of services) {
        if (s && s.id != null) this.services[String(s.id)] = s;
      }

      // map reviews by service id
      for (const r of reviews) {
        if (r && r.service && r.service.id != null) this.reviews[String(r.service.id)] = r;
      }

      this.loading = false;
      this.cdr.detectChanges();
    }, () => {
      this.loading = false;
      this.cdr.detectChanges();
    });

    // Fetch personalized recommendations
    this.serviceApi.getPersonalizedRecommendations().pipe(
      takeUntil(this.destroy$),
      catchError(() => {
        this.errorRecommendations = 'Erreur lors du chargement des recommandations.';
        this.loadingRecommendations = false;
        this.cdr.detectChanges();
        return of([] as Recommendation[]);
      })
    ).subscribe((recs: Recommendation[]) => {
      this.recommendations = recs || [];
      this.loadingRecommendations = false;
      this.cdr.detectChanges();
    });
  }

  loadReviews(serviceIds: string[]) {
    // kept for backward compatibility but no longer used in main flow
    this.reviewApi.getMyReviews().pipe(takeUntil(this.destroy$)).subscribe(myReviews => {
      for (const r of myReviews) {
        if (r.service && r.service.id != null && serviceIds.includes(String(r.service.id))) {
          this.reviews[String(r.service.id)] = r;
        }
      }
      this.loading = false;
      this.cdr.detectChanges();
    }, () => { this.loading = false; this.cdr.detectChanges(); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Types are imported from shared/api-models.ts
