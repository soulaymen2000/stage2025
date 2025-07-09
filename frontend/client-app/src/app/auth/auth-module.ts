import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Register } from './register/register';
import { AuthRoutingModule } from './auth-routing-module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login';



@NgModule({
  declarations: [
    Register,
    LoginComponent

  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AuthModule { }
