import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './auth/token-interceptor';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthModule } from './auth/auth-module';
import { SharedModule } from './shared/shared-module';
import { UserModule } from './user/user-module';
import { ServicesModule } from './services/services-module';
import { ReservationModule } from './reservation/reservation-module';
import { ReviewsModule } from './reviews/reviews-module';
import { LandingModule } from './landing/landing.module';


@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    SharedModule,
    UserModule,
    ServicesModule,
    ReservationModule,
    ReviewsModule,
    LandingModule,
    
    
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([tokenInterceptor])
    )
  ],
  bootstrap: [App]
})
export class AppModule { }
