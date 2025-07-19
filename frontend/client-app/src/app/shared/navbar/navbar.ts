import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  userRole: 'CLIENT' | 'FOURNISSEUR' | null = null;
  userName: string | null = null;

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let role = payload.role || payload.roles || payload.authorities;
        if (Array.isArray(role)) {
          if (role.length && typeof role[0] === 'object' && role[0].authority) {
            role = role.map((r: any) => r.authority.replace('ROLE_', ''));
          }
        } else if (typeof role === 'string' && role.startsWith('ROLE_')) {
          role = role.replace('ROLE_', '');
        }
        if ((Array.isArray(role) && role.includes('FOURNISSEUR')) || role === 'FOURNISSEUR') {
          this.userRole = 'FOURNISSEUR';
        } else if ((Array.isArray(role) && role.includes('CLIENT')) || role === 'CLIENT') {
          this.userRole = 'CLIENT';
        } else {
          this.userRole = null;
        }
        this.userName = payload.firstName || payload.name || payload.username || payload.email || null;
      } catch (e) {
        this.userRole = null;
        this.userName = null;
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
}
