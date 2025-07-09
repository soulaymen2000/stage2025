import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:1234/api/auth';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<string> {
    return this.http.post(this.apiUrl + '/login', credentials, { responseType: 'text' });
  }

  register(user: any): Observable<any> {
    return this.http.post(this.apiUrl + '/register', user);
  }
}
