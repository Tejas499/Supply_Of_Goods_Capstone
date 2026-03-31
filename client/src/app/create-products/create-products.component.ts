import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.scss']
})
export class CreateProductsComponent implements OnInit {
  itemForm!: FormGroup;
  products: any[] = [];
  successMsg: string = '';
  editingId: any = null;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      manufacturerId: [localStorage.getItem('userId') || ''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      stockQuantity: ['', Validators.required]
    });
    this.loadProducts();
  }

  loadProducts(): void {
    const manufacturerId = localStorage.getItem('userId');
    if (manufacturerId) {
      this.httpService.getProductsByManufacturer(manufacturerId).subscribe((res: any) => {
        this.products = res;
      });
    }
  }

  editProduct(p: any): void {
    this.editingId = p.id;
    this.itemForm.patchValue({
      name: p.name,
      description: p.description,
      price: p.price,
      stockQuantity: p.stockQuantity,
      manufacturerId: p.manufacturerId
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      if (this.editingId) {
        this.httpService.updateProduct(this.itemForm.value, this.editingId).subscribe(() => {
          this.successMsg = 'Updated Successfully';
          this.editingId = null;
          this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') });
          this.loadProducts();
        });
      } else {
        this.httpService.createProduct(this.itemForm.value).subscribe(() => {
          this.successMsg = 'Save Successfully';
          this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') });
          this.loadProducts();
        });
      }
      setTimeout(() => this.successMsg = '', 3000);
    }
  }
}