import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared-module';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', loadChildren: () => import('../services/services-module').then(m => m.ServicesModule) }
];

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class HomeModule {}
