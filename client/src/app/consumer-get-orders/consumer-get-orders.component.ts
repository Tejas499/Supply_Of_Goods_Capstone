import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
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
  filtered: any[] = [];
  searchTerm = ''; filterStatus = '';
  successMsg = ''; errorMsg = '';
  showFeedbackFor: any = null;
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;

  constructor(private fb: FormBuilder, private httpService: HttpService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.itemForm = this.fb.group({
      orderId:   [''],
      userId:    [userId || '', Validators.required],
      content:   ['', Validators.required],
      timestamp: [this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')]
    });
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = localStorage.getItem('userId');
    if (userId) this.httpService.getOrderConsumer(userId).subscribe((res: any) => {
      this.orders = res; this.applyFilter();
    });
  }

  applyFilter(): void {
    let list = [...this.orders];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(o => o.product?.name?.toLowerCase().includes(t) || String(o.id).includes(t));
    }
    if (this.filterStatus) list = list.filter(o => o.status === this.filterStatus);
    this.filtered = list; this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get pages(): number[] { return Array.from({length: this.totalPages}, (_, i) => i+1); }

  openFeedback(o: any): void {
    this.showFeedbackFor = o;
    this.itemForm.patchValue({ orderId: o.id, content: '' });
  }

  cancelOrder(o: any): void {
    this.confirmMsg = `Cancel Order #${o.id} for "${o.product?.name}"?`;
    this.confirmAction = () => {
      this.httpService.updateOrderStatus(o.id, 'CANCELLED').subscribe({
        next: () => { this.successMsg = `Order #${o.id} cancelled.`; this.loadOrders(); setTimeout(() => this.successMsg = '', 4000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Cannot cancel.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;
    const { orderId, userId, content, timestamp } = this.itemForm.value;
    this.httpService.addConsumerFeedBack(orderId, userId, { content, timestamp }).subscribe({
      next: () => { this.successMsg = '✅ Feedback submitted!'; this.showFeedbackFor = null; this.itemForm.patchValue({ content: '' }); setTimeout(() => this.successMsg = '', 3000); },
      error: () => { this.errorMsg = 'Failed to submit feedback.'; }
    });
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
}
