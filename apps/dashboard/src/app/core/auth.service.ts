import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LoginDto, AuthResponse, User } from '@app/data';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Load user from storage if possible (simplified for now, usually decode token)
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // In real app, validate token or fetch user profile
      // For now, we might not have the user object unless we stored it too
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  login(credentials: LoginDto) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem(this.tokenKey, authResult.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(authResult.user));
    this.currentUser.set(authResult.user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

