import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing-module';
import { ServiceList } from './service-list/service-list';
import { ServiceDetail } from './service-detail/service-detail';
import { FournisseurServices2Component } from './fournisseur-services2/fournisseur-services2';
import { ReactiveFormsModule } from '@angular/forms';
// Angular Material modules - only import what's actually used
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../shared/shared-module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ServiceList,
    ServiceDetail,
    FournisseurServices2Component
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    SharedModule,
    FormsModule
  ]
})
export class ServicesModule { }
