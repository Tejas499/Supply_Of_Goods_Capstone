import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'] // Ensure you add this line
})
export class RegistrationComponent {
  itemForm: FormGroup;
  errorMsg = '';
  isSubmitting = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      username: [
        '', [
          Validators.required, 
          Validators.maxLength(10), 
          Validators.pattern(/^[A-Za-z][A-Za-z0-9]*$/)
        ]
      ],
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.isSubmitting = true;
      this.errorMsg = '';
      
      this.httpService.registerUser(this.itemForm.value).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMsg = err.error?.message || "Registration failed. Please try again.";
        }
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
