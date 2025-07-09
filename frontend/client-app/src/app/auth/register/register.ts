import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.scss',
  standalone: false

})
export class Register {
  registerForm: FormGroup;
  submitting = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.submitting = true;
    this.errorMsg = '';
    const formValue = this.registerForm.value;
    this.http.post('/api/auth/register', formValue).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: err => {
        this.errorMsg = err.error?.message || 'Erreur lors de l\'inscription';
        this.submitting = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
