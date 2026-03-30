import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-consumer-get-orders',
  templateUrl: './consumer-get-orders.component.html',
  styleUrls: ['./consumer-get-orders.component.scss'],
  providers: [DatePipe]
})
export class ConsumerGetOrdersComponent implements OnInit {
  itemForm!: FormGroup;
  orders: any[] = [];

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      orderId: [''],
      userId: ['', Validators.required],
      content: [''],
      timestamp: ['']
    });

    const userId = localStorage.getItem('userId');
    if (userId) {
      this.httpService.getOrderConsumer(userId).subscribe((res: any) => {
        this.orders = res;
      });
    }
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const { orderId, userId, content, timestamp } = this.itemForm.value;
      const details = { content, timestamp };
      this.httpService.addConsumerFeedBack(orderId, userId, details).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }
}