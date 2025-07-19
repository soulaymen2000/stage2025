import { Component } from '@angular/core';

@Component({
  selector: 'app-service-list',
  standalone: false,
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss'
})
export class ServiceList {
  public services: any[] = [];
}
