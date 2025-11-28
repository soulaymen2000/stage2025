import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReservationRoutingModule } from './reservation-routing-module';
import { History } from './history/history';
import { Create } from './create/create';
import { ChatComponent } from './chat/chat.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    ReservationRoutingModule,
    ChatComponent
  ]
})
export class ReservationModule { }
