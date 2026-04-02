import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  filtered: any[] = [];
  searchTerm = ''; filterStatus = '';
  successMsg = ''; errorMsg = '';
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;

  constructor(private fb: FormBuilder, private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({ orderId: [''], status: [''] });
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = localStorage.getItem('userId');
    if (userId) this.httpService.getOrderByWholesalers(userId).subscribe((res: any) => {
      this.orders = res.map((o: any) => ({ ...o, selectedStatus: '' }));
      this.applyFilter();
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

  processOrder(orderId: any, status: string): void {
    if (!status) return;
    this.confirmMsg = `Update Order #${orderId} to "${status}"?`;
    this.confirmAction = () => {
      this.httpService.updateOrderStatus(orderId, status).subscribe({
        next: () => { this.successMsg = `Order #${orderId} → ${status}`; this.errorMsg = ''; this.loadOrders(); setTimeout(() => this.successMsg = '', 4000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Failed.'; this.successMsg = ''; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  cancelOrder(o: any): void {
    this.confirmMsg = `Cancel Order #${o.id} for "${o.product?.name}"? Stock will be restored.`;
    this.confirmAction = () => {
      this.httpService.updateOrderStatus(o.id, 'CANCELLED').subscribe({
        next: () => { this.successMsg = `Order #${o.id} cancelled. Stock restored.`; this.loadOrders(); setTimeout(() => this.successMsg = '', 4000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Cannot cancel.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
  onSubmit(): void  {}
}