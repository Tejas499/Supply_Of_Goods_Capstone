import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
// import { AuthService } from '../../services/auth.service';
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
  successMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    // private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.itemForm = this.fb.group({
      orderId: [''],
      userId: [userId || '', Validators.required],
      content: [''],
      timestamp: [this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')]
    });

    if (userId) {
      this.httpService.getOrderConsumer(userId).subscribe((res: any) => {
        this.orders = res;
      });
    }
  }

  onSubmit(): void {
    const { orderId, userId, content, timestamp } = this.itemForm.value;
    const details = { content, timestamp };
    // console.log(orderId +" from httpService");
    this.httpService.addConsumerFeedBack(orderId, userId, details).subscribe(() => {
      this.successMsg = 'Feedback submitted successfully';
      this.itemForm.patchValue({ orderId: '', content: '' });
      setTimeout(() => this.successMsg = '', 3000);
    });
  }
}