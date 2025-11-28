import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Navigation</h2>
      </div>
      
      <nav class="sidebar-nav">
        @if (userRole === 'CLIENT') {
          <a routerLink="/user/dashboard-client" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Tableau de bord</span>
          </a>
        }
        
        @if (userRole === 'FOURNISSEUR') {
          <a routerLink="/user/dashboard-fournisseur" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Tableau de bord</span>
          </a>
        }
        
        <a routerLink="/services" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🛠️</span>
          <span class="nav-text">Services</span>
        </a>
        
        <a routerLink="/messaging" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">💬</span>
          <span class="nav-text">Messagerie</span>
          @if (unreadCount > 0) {
            <span class="badge">{{ unreadCount }}</span>
          }
        </a>
        
        <a routerLink="/reservation" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📅</span>
          <span class="nav-text">Réservations</span>
        </a>
        
        <a routerLink="/user/profile" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-text">Profil</span>
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <button (click)="logout()" class="logout-btn">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Déconnexion</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: linear-gradient(135deg, #23263b 0%, #1a1c2d 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 3px 0 15px rgba(0, 0, 0, 0.2);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
    }
    
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      position: relative;
    }
    
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .nav-item.active {
      background-color: rgba(102, 126, 234, 0.3);
      color: white;
      border-left: 4px solid #667eea;
    }
    
    .nav-icon {
      font-size: 1.2rem;
      margin-right: 15px;
      width: 24px;
      text-align: center;
    }
    
    .nav-text {
      font-size: 1rem;
      font-weight: 500;
    }
    
    .badge {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-left: auto;
      box-shadow: 0 2px 5px rgba(255, 107, 107, 0.3);
    }
    
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logout-btn {
      width: 100%;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      font-size: 1rem;
    }
    
    .logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }
      
      .sidebar-header h2,
      .nav-text,
      .logout-btn span:not(.nav-icon) {
        display: none;
      }
      
      .nav-item,
      .logout-btn {
        justify-content: center;
        padding: 15px;
      }
      
      .nav-icon {
        margin-right: 0;
        font-size: 1.5rem;
      }
      
      .badge {
        position: absolute;
        top: 5px;
        right: 5px;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  userRole: 'CLIENT' | 'FOURNISSEUR' | null = null;
  unreadCount: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
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
        } catch (e) {
          this.userRole = null;
        }
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      this.router.navigate(['/auth/login']);
    }
  }
}