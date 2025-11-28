import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.scss']
})
export class DashboardAdminComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt', 'actions'];
  roles = ['CLIENT', 'FOURNISSEUR', 'ADMIN'];
  private apiUrl = '/api/users';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<User[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {
        this.users = data;
        // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  updateUserRole(userId: number, newRole: string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    
    this.http.put(`${this.apiUrl}/${userId}/role`, `"${newRole}"`, { headers }).subscribe({
      next: () => {
        this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
        // Update the local data immediately for better UX
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.role = newRole;
        }
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.snackBar.open('Error updating role', 'Close', { duration: 3000 });
        // Reload users to revert to original state if update failed
        this.loadUsers();
      }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.delete(`${this.apiUrl}/${userId}`, { headers }).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        // Update the local data immediately for better UX
        this.users = this.users.filter(u => u.id !== userId);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        // Reload users to revert to original state if delete failed
        this.loadUsers();
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  getUsersByRole(role: string): number {
    return this.users.filter(user => user.role === role).length;
  }
}
