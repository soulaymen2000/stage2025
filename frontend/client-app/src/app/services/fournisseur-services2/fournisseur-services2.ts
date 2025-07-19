import { Component, OnInit } from '@angular/core';
import { ServiceApiService } from '../service-api.service';
import { Service } from '../service.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { ReservationApiService } from '../reservation-api.service';
import { ReviewApiService } from '../review-api.service';

@Component({
  selector: 'app-fournisseur-services',
  templateUrl: './fournisseur-services2.html',
  styleUrls: ['./fournisseur-services2.scss'],
  standalone: false
})
export class FournisseurServices2Component implements OnInit {
  services: Array<Service>=[]
  serviceForm: FormGroup;
  editing = false;
  editingId: string | null = null;
  loading = true;
  ready = true;
  isFournisseur = false;
  isClient = false;
  debugRole: string = '';
  rating: { [serviceId: string]: number } = {};
  comment: { [serviceId: string]: string } = {};
  loadingReservation: { [serviceId: string]: boolean } = {};
  loadingRating: { [serviceId: string]: boolean } = {};
  successReservation: { [serviceId: string]: boolean } = {};
  successRating: { [serviceId: string]: boolean } = {};
  errorReservation: { [serviceId: string]: string } = {};
  errorRating: { [serviceId: string]: string } = {};
  public myReservations: { [serviceId: string]: boolean } = {};
  constructor(
    private api: ServiceApiService,
    private reservationApi: ReservationApiService,
    private reviewApi: ReviewApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.serviceForm = this.fb.group({
      title: '',
      description: '',
      category: '',
      price: 0,
      location: ''
    });
  }

  ngOnInit() {
    // Detect role
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
        this.isFournisseur = false;
        this.isClient = false;
        this.debugRole = 'error';
      }
    }
    //this.ready = false;
    //this.loading = false;
    this.services=[
     /* {
          "id": "6874afaf74cc3e3cab79db69",
          "title": "sahar ",
          "description": "hfgazhufbza",
          "category": "hnkjvdbhjzvb",
          "price": 300.0,
          "location": "tunis",
          "rating": 0.0,
          "ownerId": "fornisseur@gmail.com"
      }*/
  ]
    this.loadServices();
    this.reservationApi.getMyReservations().subscribe(reservations => {
      for (const r of reservations) {
        if (r.serviceId) {
          this.myReservations[r.serviceId] = true;
        }
      }
    });
  }

  loadServices() {
   
    this.api.getServices().subscribe(res => {
      console.log('API response:', res); // Debug log
      this.services = res;
        this.loading = false;
      this.ready = true;
      this.cdr.detectChanges();
      },
    error => {
        this.loading = false;
      this.ready = true;
        this.snackBar.open('Erreur lors du chargement des services', 'Fermer', { duration: 3000 });
    });
  }

  onSubmit() {
    if (this.serviceForm.invalid) return;
    const data = this.serviceForm.value;

    if (this.editing && this.editingId) {
      const currentService = this.services.find(s => s.id === this.editingId);
      if (currentService && currentService.ownerId) {
        data.ownerId = currentService.ownerId;
      }
      this.loading = true;
      this.api.updateService(this.editingId, data).subscribe({
        next: () => {
          this.loadServices();
          this.cancelEdit();
          this.snackBar.open('Service mis à jour !', 'Fermer', { duration: 2000 });
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.api.createService(data).subscribe({
        next: () => {
          this.loadServices();
          this.serviceForm.reset({title: '', description: '', category: '', price: 0, location: ''});
          this.snackBar.open('Service créé !', 'Fermer', { duration: 2000 });
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editService(s: Service) {
    this.editing = true;
    this.editingId = s.id || null;
    this.serviceForm.patchValue({
      ...s,
      ownerId: s.ownerId // ensure ownerId is present
    });
  }

  cancelEdit() {
    this.editing = false;
    this.editingId = null;
    this.serviceForm.reset({title: '', description: '', category: '', price: 0, location: ''});
  }

  deleteService(id?: string) {
    if (!id) return;
    this.loading = true;
    this.api.deleteService(id).subscribe({
      next: () => {
        this.loadServices();
        this.snackBar.open('Service supprimé !', 'Fermer', { duration: 2000 });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
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
      error: (err: any) => {
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
      error: (err: any) => {
        this.errorRating[serviceId] = err.error?.message || 'Erreur lors de la notation';
        this.loadingRating[serviceId] = false;
      }
    });
  }

  hasReserved(serviceId: string): boolean {
    return !!this.myReservations[serviceId];
  }
}
