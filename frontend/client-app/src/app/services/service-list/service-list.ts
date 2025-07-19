import { Component, OnInit } from '@angular/core';
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

  constructor(
    private api: ServiceApiService,
    private reservationApi: ReservationApiService,
    private reviewApi: ReviewApiService
  ) {}

  ngOnInit() {
    this.api.getServices().subscribe(services => {
      this.services = services;
    });
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
        console.log('isClient:', this.isClient, 'isFournisseur:', this.isFournisseur, 'role:', role);
      } catch (e) {
        this.isClient = false;
        this.isFournisseur = false;
        this.debugRole = 'error';
      }
    }
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
