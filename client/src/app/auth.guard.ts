import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {

    // ✅ route flags (use in routing `data`)
    const guestOnly: boolean = route.data?.['guestOnly'] === true;   // for login/registration
    const roles: string[] = route.data?.['roles'] || [];             // for role-based routes

    const token = this.auth.getToken?.() || localStorage.getItem('token'); // safe fallback
    const isLoggedIn = !!token;

    // -----------------------------
    // 1) Guest-only pages (login/register)
    //    If already logged in -> go dashboard
    // -----------------------------
    if (guestOnly) {
      if (isLoggedIn) return this.router.parseUrl('/dashboard');
      return true;
    }

    // -----------------------------
    // 2) Protected pages
    //    If not logged in -> logout + go login with reason
    // -----------------------------
    if (!isLoggedIn) {
      this.auth.logout();
      return this.router.createUrlTree(['/login'], { queryParams: { reason: 'session_expired' } });
    }

    // -----------------------------
    // 3) Role-based authorization
    // -----------------------------
    if (roles.length > 0) {
      const currentRole =
        this.auth.getRole ||
        localStorage.getItem('role') ||
        null;

      if (!currentRole || !roles.includes(currentRole)) {
        // If user logged in but not allowed -> send to dashboard
        return this.router.parseUrl('/login');
      }
    }

    return true;
  }
}