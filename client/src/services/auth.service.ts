import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;

  // Reactive streams — AppComponent subscribes to these
  private loggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  private role$    = new BehaviorSubject<string | null>(localStorage.getItem('role'));

  isLoggedIn$ = this.loggedIn$.asObservable();
  currentRole$ = this.role$.asObservable();

  constructor() {}

  saveToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    this.loggedIn$.next(true);
  }

  SetRole(role: any) {
    localStorage.setItem('role', role);
    this.role$.next(role);
  }

  saveUserId(userid: string) {
    localStorage.setItem('userId', userid);
  }

  getToken(): string | null {
    this.token = localStorage.getItem('token');
    return this.token;
  }

  get getLoginStatus(): boolean {
    return !!localStorage.getItem('token');
  }

  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    this.token = null;
    this.loggedIn$.next(false);
    this.role$.next(null);
  }
}