import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  IsLoggin: boolean = false;
  roleName: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isLoggedIn$.subscribe(status => this.IsLoggin = status);
    this.authService.currentRole$.subscribe(role => this.roleName = role);
  }

  logout() {
    this.authService.logout();
    // replaceUrl: true — replaces the history entry so clicking back
    // after logout does NOT go back to the protected page
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}