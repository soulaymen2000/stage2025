import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ServiceApiService } from '../service-api.service';
import { ReviewApiService } from '../review-api.service';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-service-detail',
  standalone: false,
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss'
})
export class ServiceDetail implements OnInit, OnDestroy {
  public service: any = null;
  public loading = true;
  public error: string | null = null;
  public similarServices: any[] = [];
  public reviews: any[] = [];
  public loadingReviews = true;
  public errorReviews: string | null = null;
  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private api: ServiceApiService,
    private reviewApi: ReviewApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const id = params.get('id');
        // Reset state for new fetch
        this.loading = true;
        this.service = null;
        this.similarServices = [];
        this.reviews = [];
        this.loadingReviews = true;
        this.error = null;
        this.errorReviews = null;
        this.cdr.detectChanges(); // Immediately show loader

        if (!id) {
          this.error = 'ID de service manquant.';
          this.loading = false;
          this.loadingReviews = false;
          this.cdr.detectChanges();
          return [];
        }

        console.log(`[Debug] Fetching service with ID: ${id}`);
        return this.api.getService(id);
      })
    ).subscribe({
      next: (service) => {
        console.log('[Debug] Received service from API:', service);
        if (!service) {
          this.error = 'Service introuvable.';
          this.service = null;
          this.loadingReviews = false;
        } else {
          this.service = service;
          // Fetch similar services only if main service was found
          this.api.getSimilarServices(this.service.id).subscribe({
            next: (similars) => {
              console.log('[Debug] Received similar services:', similars);
              this.similarServices = similars;
              this.cdr.detectChanges(); // Update view with similar services
            },
            error: (err) => {
              console.error('[Debug] Error fetching similar services:', err);
              this.cdr.detectChanges();
            }
          });
          // Fetch reviews for this service
          this.reviewApi.getReviewsForService(this.service.id).subscribe({
            next: (reviews) => {
              this.reviews = reviews;
              this.loadingReviews = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.errorReviews = 'Erreur lors du chargement des avis.';
              this.loadingReviews = false;
              this.cdr.detectChanges();
            }
          });
        }
        this.loading = false;
        this.cdr.detectChanges(); // Final update for the main service
      },
      error: (err) => {
        console.error('[Debug] Error fetching main service:', err);
        this.error = 'Erreur lors du chargement du service.';
        this.loading = false;
        this.loadingReviews = false;
        this.service = null;
        this.cdr.detectChanges(); // Update view with error
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
