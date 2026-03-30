import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss']
})
export class AddInventoryComponent implements OnInit {
  itemForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      wholesalerId: [localStorage.getItem('userId') || ''],
      stockQuantity: ['', Validators.required],
      productId: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const productId = this.itemForm.value.productId;
      const details = {
        wholesalerId: this.itemForm.value.wholesalerId,
        stockQuantity: this.itemForm.value.stockQuantity
      };
      this.httpService.addInventory(details, productId).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }
}