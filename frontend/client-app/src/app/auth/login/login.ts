import { Component, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  submitting = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.submitting = true;
    this.errorMsg = '';

    const { email, password } = this.loginForm.value;

    this.http.post<any>('/api/auth/login', { email, password }).subscribe({
      next: (res) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
        }
        try {
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          let role = payload.role || payload.roles || payload.authorities;
          if (Array.isArray(role)) {
            if (role.length && typeof role[0] === 'object' && role[0].authority) {
              role = role.map((r: any) => r.authority.replace('ROLE_', ''));
            }
          } else if (typeof role === 'string' && role.startsWith('ROLE_')) {
            role = role.replace('ROLE_', '');
          }
          if ((Array.isArray(role) && role.includes('FOURNISSEUR')) || role === 'FOURNISSEUR') {
            this.router.navigate(['/user/dashboard-fournisseur']).catch(() => {
              this.errorMsg = "Redirection vers le dashboard fournisseur impossible. Vérifiez la route.";
            });
          } else {
            this.router.navigate(['/user/dashboard-client']).catch(() => {
              this.errorMsg = "Redirection vers le dashboard client impossible. Vérifiez la route.";
            });
          }
        } catch (e) {
          this.errorMsg = "Erreur lors de l'analyse du token.";
        }
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Email ou mot de passe incorrect';
        this.submitting = false;
      }
    });
  }
}
