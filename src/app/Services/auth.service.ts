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

  baseUrl = 'https://fakestoreapi.com/';  // Not used for real auth
  useMockAuth = false; // Using mock auth since FakeStore doesn't have auth endpoints
  
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated = false;
  private token: string | null = null;

  constructor(private Http: HttpClient, private router: Router) {}

  // Login method
  login(obj: any): Observable<any> {
    return this.Http.post(`${this.apiUrl}/auth/login`, obj, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res && res.data) {
          this.getProfile().subscribe(profileRes => {
            if (profileRes && profileRes.data) {
              this.currentUserSubject.next(profileRes.data);
              this.isAuthenticated = true;
              this.router.navigate(['/']); // Redirect to home
            }
          });
        }
      })
    );
  }

  // Register method
  register(obj: any): Observable<any> {
    return this.Http.post(`${this.apiUrl}/auth/register`, obj, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res && res.data) {
          this.getProfile().subscribe(profileRes => {
            if (profileRes && profileRes.data) {
              this.currentUserSubject.next(profileRes.data);
              this.isAuthenticated = true;
              this.router.navigate(['/']); // Redirect to home
            }
          });
        }
      })
    );
  }

  // Google OAuth method
  googleAuth(code: string): Observable<any> {
    return this.Http.post(`${this.apiUrl}/auth/google`, { code }, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response.status === 'Success' && response.data) {
          this.getProfile().subscribe(profileRes => {
            if (profileRes && profileRes.data) {
              this.currentUserSubject.next(profileRes.data);
              this.isAuthenticated = true;
              this.router.navigate(['/']); // Redirect to home
            }
          });
        }
      })
    );
  }

  // Get user profile from backend
  getProfile(): Observable<any> {
    return this.Http.get(`${this.apiUrl}/users/profile`, { withCredentials: true });
  }

  // Update user profile in backend
  updateProfile(obj: any, id: any): Observable<any> {
    return this.Http.put(`${this.apiUrl}/users/${id}`, obj, { withCredentials: true });
  }

  // Update user image (stub)
  updateUserImage(obj: any): Observable<any> {
    return of({ message: 'Image updated successfully' });
  }

  // Change password (stub)
  changePassword(obj: any): Observable<any> {
    return of({ message: 'Password changed successfully' });
  }

  // Check if user is logged in (in-memory only)
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  // Get current user from BehaviorSubject
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Get token (in-memory only)
  getToken(): string | null {
    return this.token;
  }

  // Logout
  logout(): void {
    this.Http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.token = null;
      this.currentUserSubject.next(null);
      this.isAuthenticated = false;
      this.router.navigate(['/']);
    });
  }

  // Get Google auth URL
  getGoogleAuthUrl(): string {
    const googleClientId = environment.googleClientId;
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&prompt=select_account`;
  }

  // Update current user in BehaviorSubject
  public updateCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

  // Delete account
  deleteAccount(): Observable<any> {
    return this.Http.delete(`${this.apiUrl}/users/me`, { withCredentials: true });
  }
}
