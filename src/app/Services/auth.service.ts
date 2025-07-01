import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = 'https://fakestoreapi.com/';  // Changed to FakeStore API
  useMockAuth = true; // Using mock auth since FakeStore doesn't have auth endpoints

  constructor(private Http: HttpClient) {
  }

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

  // Fix the method name from "getPrfile" to "getProfile"
  getProfile(): Observable<any> {
    // If using mock auth or for new users who haven't set up their profile yet
    if (this.useMockAuth) {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return of({
        data: {
          customer_id: 1,
          customer_first_name: userData.first_name || '',
          customer_last_name: userData.last_name || '',
          customer_email: userData.email || '',
          customer_phone: userData.phone || ''
        }
      });
    }
    return this.Http.get(`${this.baseUrl}users/1`);
  }

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

  updateUserImage(obj: any): Observable<any> {
    return of({ message: 'Image updated successfully' });
  }

  changePassword(obj: any): Observable<any> {
    return of({ message: 'Password changed successfully' });
  }
}
