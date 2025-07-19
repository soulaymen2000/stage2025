import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    Navbar,
    Footer
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    Navbar,
    Footer
  ]
})
export class SharedModule { }
