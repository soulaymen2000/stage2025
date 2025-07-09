import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

function isValidToken(token: string | null): boolean {
  return !!token && token !== 'null' && token !== 'undefined' && token.trim() !== '';
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(): boolean | UrlTree {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (isValidToken(token)) {
        return true;
      }
    }
    return this.router.createUrlTree(['/auth/login']);
  }
} 