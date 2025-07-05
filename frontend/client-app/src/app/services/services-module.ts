import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing-module';
import { ServiceList } from './service-list/service-list';
import { ServiceDetail } from './service-detail/service-detail';


@NgModule({
  declarations: [
    ServiceList,
    ServiceDetail
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule
  ]
})
export class ServicesModule { }
