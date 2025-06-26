import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  userName = localStorage.getItem('user_name') ?? '';
  is_login = localStorage.getItem('user_token') ? true : false;

  constructor() { }

  isLoggedIn(): boolean {
    return this.is_login;
  }
}
