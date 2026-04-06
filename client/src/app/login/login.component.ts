import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

  num1: number = 0;
  num2: number = 0;
  operator: string = '';
  captchaAnswer: number = 0;
  isCaptchaValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // ← reads ?reason= from interceptor redirect
  ) { }

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      captcha: ['', Validators.required],
    });
    this.generateCaptcha();

    // Show a friendly message when the interceptor auto-redirected here
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session_expired') {
      this.errorMsg = 'Your session has expired. Please log in again.';
    }
  }

  generateCaptcha() {
    const operators = ['+', '-', '*', '/'];
    this.operator = operators[Math.floor(Math.random() * operators.length)];
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;
    if (this.operator === '/') this.num1 = this.num1 * this.num2;
    switch (this.operator) {
      case '+': this.captchaAnswer = this.num1 + this.num2; break;
      case '-': this.captchaAnswer = this.num1 - this.num2; break;
      case '*': this.captchaAnswer = this.num1 * this.num2; break;
      case '/': this.captchaAnswer = this.num1 / this.num2; break;
    }
    this.itemForm.get('captcha')?.setValue('');
    this.isCaptchaValid = false;
  }

  validateCaptcha() {
    const value = this.itemForm.get('captcha')?.value;
    this.isCaptchaValid = Number(value) === this.captchaAnswer;
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.httpService.Login(this.itemForm.value).subscribe({
        next: (res: any) => {
          this.authService.saveToken(res.token);
          this.authService.SetRole(res.role);
          this.authService.SetUsername(this.itemForm.value.username);
          this.authService.saveUserId(String(res.userId));

          // Replace current history entry so back button cannot return to /login
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        },
        error: () => {
          this.errorMsg = 'Invalid username or password.';
          this.generateCaptcha();
        }
      });
    }
  }
}