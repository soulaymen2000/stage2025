import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceApiService } from '../service-api.service';

@Component({
  selector: 'app-service-detail',
  standalone: false,
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss'
})
export class ServiceDetail implements OnInit {
  public service: any = null;
  public loading = true;
  public error: string | null = null;

  constructor(private route: ActivatedRoute, private api: ServiceApiService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getService(id).subscribe({
        next: (service) => {
          this.service = service;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du service.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'ID de service manquant.';
      this.loading = false;
    }
  }
}
