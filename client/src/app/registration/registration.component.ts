import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html'
 
})
export class RegistrationComponent {
  itemForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required , Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      email: ['', [Validators.required, Validators.email , Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.httpService.registerUser(this.itemForm.value).subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }
}