import { Component, OnInit } from '@angular/core';
import { ServiceApiService } from '../service-api.service';

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

  constructor(private api: ServiceApiService) {}

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
        if ((Array.isArray(role) && role.includes('FOURNISSEUR')) || role === 'FOURNISSEUR') {
          this.isFournisseur = true;
        } else if ((Array.isArray(role) && role.includes('CLIENT')) || role === 'CLIENT') {
          this.isClient = true;
        }
      } catch (e) {
        this.isClient = false;
        this.isFournisseur = false;
      }
    }
  }
}
