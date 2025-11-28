import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { History } from './history/history';
import { Create } from './create/create';
import { AuthGuard } from '../shared/auth.guard';

const routes: Routes = [
  { path: 'history', component: History, canActivate: [AuthGuard] },
  { path: 'create', component: Create, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationRoutingModule { }
