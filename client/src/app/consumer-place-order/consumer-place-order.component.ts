import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consumer-place-order',
  templateUrl: './consumer-place-order.component.html',
  styleUrls: ['./consumer-place-order.component.scss']
})
export class ConsumerPlaceOrderComponent implements OnInit {
  itemForm!: FormGroup;
  products: any[] = [];
  wholesalers: any[] = [];
  selectedProduct: any = null;
  successMsg: string = '';
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      quantity: ['', Validators.required],
      // status:   ['', Validators.required],
      productId: ['']
    });

    // Load products — each product has .manufacturer { id, username, email }
    this.httpService.getProductsByConsumers().subscribe((res: any) => {
      this.products = res;
    });
  }

  // When consumer clicks a product row — load wholesalers who carry it
  viewWholesalers(p: any): void {
    this.selectedProduct = p;
    this.itemForm.patchValue({ productId: p.id });
    this.wholesalers = [];
    this.httpService.getWholesalersForProduct(p.id).subscribe((res: any) => {
      this.wholesalers = res;
    });
  }

  selectProduct(p: any): void {
    this.selectedProduct = p;
    this.itemForm.patchValue({ productId: p.id });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const userId    = localStorage.getItem('userId');
      const productId = this.itemForm.value.productId;
      const details   = {
        quantity: this.itemForm.value.quantity,
        status:   this.itemForm.value.status
      };
      this.httpService.consumerPlaceOrder(details, productId, userId).subscribe({
        next: () => {
          this.successMsg = 'Order placed successfully!';
          this.errorMsg   = '';
          this.itemForm.reset();
          this.wholesalers    = [];
          this.selectedProduct = null;
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: (err: any) => {
          this.errorMsg   = err.error?.message || 'Insufficient stock or error placing order.';
          this.successMsg = '';
        }
      });
    }
  }
}