import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {
  itemForm!: FormGroup;
  products: any[] = [];

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

    this.httpService.getProductsByWholesaler().subscribe((res: any) => {
      this.products = res;
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const userId = localStorage.getItem('userId');
      const productId = this.itemForm.value.productId;
      const details = { quantity: this.itemForm.value.quantity, status: this.itemForm.value.status };
      this.httpService.placeOrder(details, productId, userId).subscribe(() => {
        this.router.navigate(['/get-orders']);
      });
    }
  }
}