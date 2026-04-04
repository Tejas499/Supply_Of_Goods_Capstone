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

  num1: number = 0;
  num2: number = 0;
  operator: string = '';
  captchaAnswer: number = 0;
  isCaptchaValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      captcha: ['', Validators.required]
    });
    this.generateCaptcha();
  }

  generateCaptcha() {
    const operators = ['+', '-', '*']; // Removed division for simplicity if needed, but left logic below
    this.operator = operators[Math.floor(Math.random() * operators.length)];
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;

    switch (this.operator) {
      case '+': this.captchaAnswer = this.num1 + this.num2; break;
      case '-': this.captchaAnswer = this.num1 - this.num2; break;
      case '*': this.captchaAnswer = this.num1 * this.num2; break;
    }
    
    this.itemForm.get('captcha')?.setValue('');
    this.isCaptchaValid = false;
  }

  validateCaptcha() {
    const value = this.itemForm.get('captcha')?.value;
    this.isCaptchaValid = Number(value) === this.captchaAnswer;
  }

  onSubmit(): void {
    if (this.itemForm.valid && this.isCaptchaValid) {
      this.httpService.Login(this.itemForm.value).subscribe({
        next: (res: any) => {
          this.authService.saveToken(res.token);
          this.authService.SetRole(res.role);
          this.authService.saveUserId(String(res.userId));
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMsg = 'Invalid credentials. Access Denied.';
          this.generateCaptcha();
        }
      });
    }
  }
}
