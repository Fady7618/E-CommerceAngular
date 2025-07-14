import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of, BehaviorSubject } from "rxjs";
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = 'https://fakestoreapi.com/';  // Changed to FakeStore API
  useMockAuth = true; // Using mock auth since FakeStore doesn't have auth endpoints
  
  // Add these new properties for OAuth
  private apiUrl = 'http://localhost:5000/api/auth'; // Will be updated from environment
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated = false;

  constructor(private Http: HttpClient, private router: Router) {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('user_token');
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && userData) {
      this.currentUserSubject.next(userData);
      this.isAuthenticated = true;
    }
  }

  // Existing login method
  login(obj: any): Observable<any> {
    if (this.useMockAuth) {
      // Mock login - simulate successful login
      return of({
        status: 'Success',
        data: {
          token: 'mock-token-' + Date.now(),
          first_name: 'John',
          last_name: 'Doe',
          email: obj.email
        }
      });
    }
    return this.Http.post(`${this.baseUrl}auth/login`, obj);
  }

  // Existing register method
  register(obj: any): Observable<any> {
    if (this.useMockAuth) {
      // Mock registration - simulate successful registration
      return of({
        status: 'Success',
        data: {
          token: 'mock-token-' + Date.now(),
          first_name: obj.first_name,
          last_name: obj.last_name,
          email: obj.email,
          phone: obj.phone
        }
      });
    }
    return this.Http.post(`${this.baseUrl}users`, obj);
  }

  // Google OAuth method - NEW
  googleAuth(code: string): Observable<any> {
    if (this.useMockAuth) {
      // Mock Google auth - simulate successful login with Google
      return of({
        status: 'Success',
        data: {
          token: 'mock-google-token-' + Date.now(),
          first_name: 'Google',
          last_name: 'User',
          email: 'google.user@example.com',
          profile_image: 'https://via.placeholder.com/150',
          provider: 'google'
        }
      }).pipe(
        tap(response => {
          if (response.status === 'Success') {
            this.storeUserData(response.data);
          }
        })
      );
    }
    return this.Http.post(`${this.apiUrl}/google`, { code }).pipe(
      tap(response => {
        if (response.status === 'Success') {
          this.storeUserData(response.data);
        }
      })
    );
  }

  // Store user data - NEW
  private storeUserData(userData: any): void {
    const { token, ...user } = userData;
    
    localStorage.setItem('user_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticated = true;
  }

  // Existing getProfile method
  getProfile(): Observable<any> {
    // If using mock auth or for new users who haven't set up their profile yet
    if (this.useMockAuth) {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return of({
        status: 'Success',
        data: {
          customer_id: 1,
          customer_first_name: userData.first_name || '',
          customer_last_name: userData.last_name || '',
          customer_email: userData.email || '',
          customer_phone: userData.phone || '',
          profile_image: userData.profile_image || '',
          provider: userData.provider || 'local'
        }
      });
    }
    return this.Http.get(`${this.baseUrl}users/1`);
  }

  // Existing updateProfile method
  updateProfile(obj: any, id: any): Observable<any> {
    if (this.useMockAuth) {
      // Mock profile update
      localStorage.setItem('mock_user', JSON.stringify(obj));
      return of({
        data: {
          customer_first_name: obj.first_name,
          customer_last_name: obj.last_name,
          customer_email: obj.email,
          customer_phone: obj.phone
        }
      });
    }
    return this.Http.put(`${this.baseUrl}users/${id}`, obj);
  }

  // Existing updateUserImage method
  updateUserImage(obj: any): Observable<any> {
    return of({ message: 'Image updated successfully' });
  }

  // Existing changePassword method
  changePassword(obj: any): Observable<any> {
    return of({ message: 'Password changed successfully' });
  }

  // NEW methods for OAuth functionality
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user_token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('user_token');
  }

  logout(): void {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    
    this.currentUserSubject.next(null);
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }

  // Get Google auth URL - NEW
  getGoogleAuthUrl(): string {
    const googleClientId = environment.googleClientId;
    const redirectUri = encodeURIComponent('http://localhost:4200/auth/callback');
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&prompt=select_account`;
  }
}
