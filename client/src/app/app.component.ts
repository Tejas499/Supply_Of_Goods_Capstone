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
    // Reactively update navbar whenever login/logout/role changes
    this.authService.isLoggedIn$.subscribe(status => {
      this.IsLoggin = status;
    });
    this.authService.currentRole$.subscribe(role => {
      this.roleName = role;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}