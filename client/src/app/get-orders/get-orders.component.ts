import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-get-orders',
  templateUrl: './get-orders.component.html',
  styleUrls: ['./get-orders.component.scss']
})
export class GetOrdersComponent implements OnInit {
  itemForm!: FormGroup;
  orders: any[] = [];
  newStatus: string = '';
  successMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      orderId: [''],
      status: ['']
    });

    const userId = localStorage.getItem('userId');
    if (userId) {
      this.httpService.getOrderByWholesalers(userId).subscribe((res: any) => {
        this.orders = res;
      });
    }
  }

  processOrder(orderId: any): void {
    if (this.newStatus) {
      this.httpService.updateOrderStatus(orderId, this.newStatus).subscribe(() => {
        this.successMsg = 'Order status updated';
        const userId = localStorage.getItem('userId');
        if (userId) {
          this.httpService.getOrderByWholesalers(userId).subscribe((res: any) => {
            this.orders = res;
          });
        }
        setTimeout(() => this.successMsg = '', 3000);
      });
    }
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const { orderId, status } = this.itemForm.value;
      this.httpService.updateOrderStatus(orderId, status).subscribe(() => {
        this.successMsg = 'Order status updated';
        setTimeout(() => this.successMsg = '', 3000);
      });
    }
  }
}