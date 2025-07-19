import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardClientComponent } from './dashboard/client/dashboard-client.component';
import { DashboardFournisseurComponent } from './dashboard/fournisseur/dashboard-fournisseur.component';
import { UserRoutingModule } from './user-routing-module';
import { SharedModule } from '../shared/shared-module';

@NgModule({
  declarations: [
    DashboardClientComponent,
    DashboardFournisseurComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule
  ]
})
export class UserModule { }
