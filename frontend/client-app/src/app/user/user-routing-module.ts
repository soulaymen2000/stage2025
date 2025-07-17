import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardClientComponent } from './dashboard/client/dashboard-client.component';
import { DashboardFournisseurComponent } from './dashboard/fournisseur/dashboard-fournisseur.component';
import { AuthGuard } from '../shared/auth.guard';
import { FournisseurServices2Component } from '../services/fournisseur-services2/fournisseur-services2';

const routes: Routes = [
  { path: 'dashboard-client', component: DashboardClientComponent, canActivate: [AuthGuard] },
  { path: 'dashboard-fournisseur', component: DashboardFournisseurComponent, canActivate: [AuthGuard] },
  { path: 'services', component: FournisseurServices2Component, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
