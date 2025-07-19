import { Component } from '@angular/core';

@Component({
  selector: 'app-service-detail',
  standalone: false,
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss'
})
export class ServiceDetail {
  public service: any = null;
}
