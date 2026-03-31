import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  itemForm!: FormGroup;
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.httpService.Login(this.itemForm.value).subscribe({
        next: (res: any) => {
          // Save to localStorage AND emit via BehaviorSubject so navbar reacts instantly
          this.authService.saveToken(res.token);
          this.authService.SetRole(res.role);
          this.authService.saveUserId(String(res.userId));
          // Use Angular router — no page reload needed because AppComponent now subscribes reactively
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMsg = 'Invalid username or password.';
        }
      });
    }
  }
}