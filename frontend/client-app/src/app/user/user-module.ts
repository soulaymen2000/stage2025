import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardClientComponent } from './dashboard/client/dashboard-client.component';
import { DashboardFournisseurComponent } from './dashboard/fournisseur/dashboard-fournisseur.component';
import { UserRoutingModule } from './user-routing-module';

@NgModule({
  declarations: [
    DashboardClientComponent,
    DashboardFournisseurComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }
