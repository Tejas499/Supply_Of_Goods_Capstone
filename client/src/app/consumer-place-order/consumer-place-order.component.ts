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
  successMsg: string = '';
  selectedProductId: any = null;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      quantity: ['', Validators.required],
      status: ['', Validators.required],
      productId: ['']
    });

    this.httpService.getProductsByConsumers().subscribe((res: any) => {
      this.products = res;
    });
  }

  selectProduct(p: any): void {
    this.selectedProductId = p.id;
    this.itemForm.patchValue({ productId: p.id });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const userId = localStorage.getItem('userId');
      const productId = this.selectedProductId || this.itemForm.value.productId;
      const details = {
        quantity: this.itemForm.value.quantity,
        status: this.itemForm.value.status
      };
      this.httpService.consumerPlaceOrder(details, productId, userId).subscribe(() => {
        this.successMsg = 'Order placed successfully';
        this.itemForm.reset();
        setTimeout(() => this.successMsg = '', 3000);
      });
    }
  }
}