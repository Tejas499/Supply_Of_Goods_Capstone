import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-get-orders',
  templateUrl: './get-orders.component.html',
  styleUrls: ['./get-orders.component.scss']
})
export class GetOrdersComponent implements OnInit {
  itemForm!: FormGroup;

  // PLACED orders (W2M) — wholesaler placed to manufacturer
  placedOrders: any[] = [];
  placedFiltered: any[] = [];
  placedSearch = ''; placedFilterStatus = '';
  placedPage = 1; pageSize = 5;

  // RECEIVED orders (C2W) — consumer placed to this wholesaler
  receivedOrders: any[] = [];
  receivedFiltered: any[] = [];
  receivedSearch = ''; receivedFilterStatus = '';
  receivedPage = 1;

  feedbacks: any[] = [];
  successMsg = ''; errorMsg = '';
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  activeTab = 'placed'; // 'placed' | 'received'

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({ orderId: [''], status: [''] });
    this.loadAll();
  }

  loadAll(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    // Load placed orders (W2M)
    this.httpService.getPlacedOrders(userId).subscribe((res: any) => {
      this.placedOrders = res.map((o: any) => ({ ...o, selectedStatus: '' }));
      this.applyPlacedFilter();
    });
    // Load received orders (C2W)
    this.httpService.getReceivedOrders(userId).subscribe((res: any) => {
      this.receivedOrders = res.map((o: any) => ({ ...o, selectedStatus: '' }));
      this.applyReceivedFilter();
    });
    // Load feedbacks
    this.httpService.getWholesalerFeedbacks(userId).subscribe({
      next: (res: any) => { this.feedbacks = res; },
      error: () => {}
    });
  }

  applyPlacedFilter(): void {
    let list = [...this.placedOrders];
    if (this.placedSearch) { const t = this.placedSearch.toLowerCase(); list = list.filter(o => o.product?.name?.toLowerCase().includes(t) || String(o.id).includes(t)); }
    if (this.placedFilterStatus) list = list.filter(o => o.status === this.placedFilterStatus);
    this.placedFiltered = list; this.placedPage = 1;
  }

  applyReceivedFilter(): void {
    let list = [...this.receivedOrders];
    if (this.receivedSearch) { const t = this.receivedSearch.toLowerCase(); list = list.filter(o => o.product?.name?.toLowerCase().includes(t) || String(o.id).includes(t)); }
    if (this.receivedFilterStatus) list = list.filter(o => o.status === this.receivedFilterStatus);
    this.receivedFiltered = list; this.receivedPage = 1;
  }

  get placedPaged(): any[] { return this.placedFiltered.slice((this.placedPage-1)*this.pageSize, this.placedPage*this.pageSize); }
  get placedTotalPages(): number { return Math.ceil(this.placedFiltered.length / this.pageSize); }
  get placedPages(): number[] { return Array.from({length: this.placedTotalPages}, (_, i) => i+1); }

  get receivedPaged(): any[] { return this.receivedFiltered.slice((this.receivedPage-1)*this.pageSize, this.receivedPage*this.pageSize); }
  get receivedTotalPages(): number { return Math.ceil(this.receivedFiltered.length / this.pageSize); }
  get receivedPages(): number[] { return Array.from({length: this.receivedTotalPages}, (_, i) => i+1); }

  // Wholesaler marks W2M order as received (OUT FOR DELIVERY → DELIVERED + inventory updated)
  markReceived(o: any): void {
    this.confirmMsg = `Mark Order #${o.id} as RECEIVED? This will add ${o.quantity} units of "${o.product?.name}" to your inventory.`;
    this.confirmAction = () => {
      const wholesalerId = localStorage.getItem('userId');
      this.httpService.markOrderReceived(o.id, wholesalerId).subscribe({
        next: () => { this.successMsg = `✅ Order #${o.id} received! ${o.quantity} units added to your inventory.`; this.errorMsg = ''; this.loadAll(); setTimeout(() => this.successMsg = '', 5000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Cannot mark as received yet.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }
  cancelReceivedOrder(o: any): void {
  if (!confirm(`Cancel order #${o.id}? Stock will be restored.`)) return;

  this.httpService.cancelWholesalerOrder(o.id).subscribe({
    next: () => {
      this.successMsg = `Order #${o.id} cancelled successfully`;
      this.loadAll(); // reload list
      setTimeout(() => this.successMsg = '', 3000);
    },
    error: (err: any) => {
      this.errorMsg = err.error?.message || "Cannot cancel this order";
    }
  });
}

  // Update received order (C2W) status
  updateReceivedOrder(orderId: any, status: string): void {
    if (!status) return;
    this.confirmMsg = `Update Order #${orderId} to "${status}"?`;
    this.confirmAction = () => {
      this.httpService.updateOrderStatus(orderId, status).subscribe({
        next: () => { this.successMsg = `Order #${orderId} → ${status}`; this.loadAll(); setTimeout(() => this.successMsg = '', 4000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Failed.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  cancelPlacedOrder(o: any): void {
    this.confirmMsg = `Cancel Order #${o.id} for "${o.product?.name}"? Manufacturer stock will be restored.`;
    this.confirmAction = () => {
      this.httpService.cancelWholesalerOrder(o.id).subscribe({
        next: () => { this.successMsg = `Order #${o.id} cancelled.`; this.loadAll(); setTimeout(() => this.successMsg = '', 4000); },
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