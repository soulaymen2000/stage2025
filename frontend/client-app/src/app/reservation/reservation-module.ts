import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservationRoutingModule } from './reservation-routing-module';
import { History } from './history/history';
import { Create } from './create/create';


@NgModule({
  declarations: [
    History,
    Create
  ],
  imports: [
    CommonModule,
    ReservationRoutingModule
  ]
})
export class ReservationModule { }
