import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private _loginStateSubject: BehaviorSubject<boolean>;
  public loginState$: Observable<boolean>;

  userName = localStorage.getItem('user_name') ?? '';
  is_login = localStorage.getItem('user_token') ? true : false;

  constructor() {
    // Initialize the BehaviorSubject with the current login state
    this._loginStateSubject = new BehaviorSubject<boolean>(this.is_login);
    this.loginState$ = this._loginStateSubject.asObservable();
  }

  isLoggedIn(): boolean {
    return this.is_login;
  }

  // Update these methods to properly set login state
  setLoggedIn(value: boolean): void {
    this.is_login = value;
    this._loginStateSubject.next(value);
  }

  // Call this when user logs in
  login(username: string): void {
    this.userName = username;
    this.is_login = true;
    this._loginStateSubject.next(true);
  }

  // Call this when user logs out
  logout(): void {
    this.userName = '';
    this.is_login = false;
    this._loginStateSubject.next(false);
  }
}
