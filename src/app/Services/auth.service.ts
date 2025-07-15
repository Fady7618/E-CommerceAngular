import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of, BehaviorSubject } from "rxjs";
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = 'https://fakestoreapi.com/';  // Changed to FakeStore API
  useMockAuth = false; // Using mock auth since FakeStore doesn't have auth endpoints
  
  // Add these new properties for OAuth
  private apiUrl = 'http://localhost:5000/api';
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
    return this.Http.post(`${this.apiUrl}/login`, obj).pipe(
      tap((res: any) => {
        // Only update state if login is successful
        if (res && res.data && res.data.token) {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
        }
      })
    );
  }

  // Existing register method
  register(obj: any): Observable<any> {
    return this.Http.post(`${this.apiUrl}/auth/register`, obj);
  }

  // Google OAuth method - NEW
  googleAuth(code: string): Observable<any> {
  return this.Http.post(`${this.apiUrl}/auth/google`, { code }).pipe(
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
    return this.Http.put(`${this.apiUrl}/users/${id}`, obj);
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
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&prompt=select_account`;
  }

  public updateCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

  deleteAccount(): Observable<any> {
    return this.Http.delete(`${this.apiUrl}/users/me`);
  }
}
