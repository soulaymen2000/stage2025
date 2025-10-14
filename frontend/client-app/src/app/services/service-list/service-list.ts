import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ServiceApiService } from '../service-api.service';
import { Service } from '../service.model';
import { ReservationApiService } from '../reservation-api.service';
import { ReviewApiService } from '../review-api.service';
import { ReservationCreate, ReviewCreate } from '../../shared/api-models';

@Component({
  selector: 'app-service-list',
  standalone: false,
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss'
})
export class ServiceList implements OnInit {
  public services: Service[] = [];
  public isClient = false;
  public isFournisseur = false;
  public rating: { [serviceId: string]: number } = {};
  public comment: { [serviceId: string]: string } = {};
  public loadingReservation: { [serviceId: string]: boolean } = {};
  public loadingRating: { [serviceId: string]: boolean } = {};
  public successReservation: { [serviceId: string]: boolean } = {};
  public successRating: { [serviceId: string]: boolean } = {};
  public errorReservation: { [serviceId: string]: string } = {};
  public errorRating: { [serviceId: string]: string } = {};
  public debugRole: string = '';
  public forbiddenError: string | null = null;

  // Filter state
  public filter = {
    category: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    location: '',
    minRating: null as number | null
  };

  constructor(
    private api: ServiceApiService,
    private reservationApi: ReservationApiService,
    private reviewApi: ReviewApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          let role = payload.role || payload.roles || payload.authorities;
          if (Array.isArray(role)) {
            if (role.length && typeof role[0] === 'object' && role[0].authority) {
              role = role.map((r: any) => r.authority.replace('ROLE_', ''));
            }
          } else if (typeof role === 'string' && role.startsWith('ROLE_')) {
            role = role.replace('ROLE_', '');
          }
          this.debugRole = JSON.stringify(role);
          if ((Array.isArray(role) && role.includes('FOURNISSEUR')) || role === 'FOURNISSEUR') {
            this.isFournisseur = true;
          } else if ((Array.isArray(role) && role.includes('CLIENT')) || role === 'CLIENT') {
            this.isClient = true;
          }
          this.cdr.detectChanges();
          this.fetchServices();
        } catch (e) {
          this.isClient = false;
          this.isFournisseur = false;
          this.debugRole = 'error';
          this.fetchServices();
        }
      } else {
        this.fetchServices();
      }
    } else {
      this.fetchServices();
    }
  }

  fetchServices() {
    const params: Record<string, string | number | null> = {};
  if (this.filter.category) params['category'] = this.filter.category;
  if (this.filter.minPrice != null) params['minPrice'] = this.filter.minPrice;
  if (this.filter.maxPrice != null) params['maxPrice'] = this.filter.maxPrice;
  if (this.filter.location) params['location'] = this.filter.location;
  if (this.filter.minRating != null) params['minRating'] = this.filter.minRating;
    this.api.getServices(params).subscribe({
      next: (services: Service[]) => {
        this.services = services || [];
        this.forbiddenError = null;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.services = [];
        if (err?.status === 403) {
          this.forbiddenError = 'Vous devez être connecté pour voir les services.';
        } else {
          this.forbiddenError = 'Erreur lors du chargement des services.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange() {
    this.fetchServices();
  }

  resetFilters() {
    this.filter = {
      category: '',
      minPrice: null,
      maxPrice: null,
      location: '',
      minRating: null
    };
    this.fetchServices();
  }

  reserve(serviceId?: string) {
    const key = String(serviceId);
    this.loadingReservation[key] = true;
    this.successReservation[key] = false;
    this.errorReservation[key] = '';
  const payload: ReservationCreate = { service: { id: String(serviceId) } };
  this.reservationApi.createReservation(payload).subscribe({
      next: () => {
        this.successReservation[key] = true;
        this.loadingReservation[key] = false;
      },
      error: err => {
        // Show friendly message for duplicate reservation
        if (err.status === 409) {
          this.errorReservation[key] = 'Vous avez déjà réservé ce service.';
        } else {
          this.errorReservation[key] = err.error?.message || 'Erreur lors de la réservation';
        }
        this.loadingReservation[key] = false;
      }
    });
  }

  setRating(serviceId?: string, value?: number) {
    const key = String(serviceId);
    this.rating[key] = value || 0;
  }

  submitRating(serviceId?: string) {
    const key = String(serviceId);
    this.loadingRating[key] = true;
    this.successRating[key] = false;
    this.errorRating[key] = '';
    // Send service as object with id for backend compatibility
  const reviewPayload: ReviewCreate = { service: { id: String(serviceId) }, rating: this.rating[key], comment: this.comment[key] || '' };
    this.reviewApi.createReview(reviewPayload).subscribe({
      next: () => {
        this.successRating[key] = true;
        this.loadingRating[key] = false;
      },
      error: err => {
        this.errorRating[key] = err.error?.message || 'Erreur lors de la notation';
        this.loadingRating[key] = false;
      }
    });
  }

  // Template-friendly getters (avoid indexing with possibly undefined keys)
  getLoadingReservation(serviceId?: string) {
    return !!this.loadingReservation[String(serviceId)];
  }

  getSuccessReservation(serviceId?: string) {
    return !!this.successReservation[String(serviceId)];
  }

  getErrorReservation(serviceId?: string) {
    return this.errorReservation[String(serviceId)] || '';
  }

  getLoadingRating(serviceId?: string) {
    return !!this.loadingRating[String(serviceId)];
  }

  getSuccessRating(serviceId?: string) {
    return !!this.successRating[String(serviceId)];
  }

  getErrorRating(serviceId?: string) {
    return this.errorRating[String(serviceId)] || '';
  }

  getRating(serviceId?: string) {
    return this.rating[String(serviceId)] || 0;
  }

  getComment(serviceId?: string) {
    return this.comment[String(serviceId)] || '';
  }

  setComment(serviceId?: string, value?: string) {
    this.comment[String(serviceId)] = value || '';
  }
}
