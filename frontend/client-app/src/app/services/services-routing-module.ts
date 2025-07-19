import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceList } from './service-list/service-list';

const routes: Routes = [
  { path: '', component: ServiceList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
