import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
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

      // ADDED confirmPassword
      confirmPassword: ['', Validators.required],

      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      role: ['', Validators.required]
    }, {
      // ADDED custom validator
      validators: this.passwordMatchValidator
    });
  }

  // NEW VALIDATOR FUNCTION
passwordMatchValidator(form: AbstractControl) {
  const passwordControl = form.get('password');
  const confirmPasswordControl = form.get('confirmPassword');

  if (!passwordControl || !confirmPasswordControl) return null;

  //  Only check mismatch if both fields have value
  if (confirmPasswordControl.value) {
    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ mismatch: true });
    } else {
      //  Remove only mismatch error, keep others
      if (confirmPasswordControl.hasError('mismatch')) {
        const errors = { ...confirmPasswordControl.errors };
        delete errors['mismatch'];
        confirmPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  return null;
}

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.isSubmitting = true;
      this.errorMsg = '';

      // remove confirmPassword before sending API
      const { confirmPassword, ...formData } = this.itemForm.value;

      this.httpService.registerUser(formData).subscribe({
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