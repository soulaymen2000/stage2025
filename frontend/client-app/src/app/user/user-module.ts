import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing-module';
import { Dashboard } from './dashboard/dashboard';


@NgModule({
  declarations: [
    Dashboard
  ],
  imports: [
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }
