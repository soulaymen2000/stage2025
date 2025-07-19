import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ServiceApiService } from '../service-api.service';
import { ReservationApiService } from '../reservation-api.service';
import { ReviewApiService } from '../review-api.service';

@Component({
  selector: 'app-service-list',
  standalone: false,
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss'
})
export class ServiceList implements OnInit {
  public services: any[] = [];
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
    const params: any = {};
    if (this.filter.category) params.category = this.filter.category;
    if (this.filter.minPrice != null) params.minPrice = this.filter.minPrice;
    if (this.filter.maxPrice != null) params.maxPrice = this.filter.maxPrice;
    if (this.filter.location) params.location = this.filter.location;
    if (this.filter.minRating != null) params.minRating = this.filter.minRating;
    this.api.getServices(params).subscribe({
      next: services => {
        this.services = services;
        this.forbiddenError = null;
        this.cdr.detectChanges();
      },
      error: err => {
        if (err.status === 403) {
          this.forbiddenError = 'Vous devez être connecté pour voir les services.';
          this.services = [];
        } else {
          this.forbiddenError = 'Erreur lors du chargement des services.';
          this.services = [];
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

  reserve(serviceId: string) {
    this.loadingReservation[serviceId] = true;
    this.successReservation[serviceId] = false;
    this.errorReservation[serviceId] = '';
    this.reservationApi.createReservation({ serviceId }).subscribe({
      next: () => {
        this.successReservation[serviceId] = true;
        this.loadingReservation[serviceId] = false;
      },
      error: err => {
        this.errorReservation[serviceId] = err.error?.message || 'Erreur lors de la réservation';
        this.loadingReservation[serviceId] = false;
      }
    });
  }

  setRating(serviceId: string, value: number) {
    this.rating[serviceId] = value;
  }

  submitRating(serviceId: string) {
    this.loadingRating[serviceId] = true;
    this.successRating[serviceId] = false;
    this.errorRating[serviceId] = '';
    this.reviewApi.createReview({
      serviceId,
      rating: this.rating[serviceId],
      comment: this.comment[serviceId] || ''
    }).subscribe({
      next: () => {
        this.successRating[serviceId] = true;
        this.loadingRating[serviceId] = false;
      },
      error: err => {
        this.errorRating[serviceId] = err.error?.message || 'Erreur lors de la notation';
        this.loadingRating[serviceId] = false;
      }
    });
  }
}
