import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';



@NgModule({
  declarations: [
    Navbar,
    Footer
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
