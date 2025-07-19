import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceList } from './service-list/service-list';
import { ServiceDetail } from './service-detail/service-detail';

const routes: Routes = [
  { path: '', component: ServiceList },
  { path: ':id', component: ServiceDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
