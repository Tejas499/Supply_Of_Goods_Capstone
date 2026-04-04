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
  userName: string = '';

  // Data Arrays
  placedOrders: any[] = [];
  placedFiltered: any[] = [];
  receivedOrders: any[] = [];
  receivedFiltered: any[] = [];
  feedbacks: any[] = [];

  // Filter & Pagination States
  placedSearch = ''; 
  placedFilterStatus = '';
  placedPage = 1; 
  receivedSearch = ''; 
  receivedFilterStatus = '';
  receivedPage = 1;
  pageSize = 5;

  // UI States
  successMsg = ''; 
  errorMsg = '';
  showConfirm = false; 
  confirmMsg = ''; 
  confirmAction: any = null;
  activeTab = 'placed'; // 'placed' | 'received' | 'feedback'

  constructor(private fb: FormBuilder, private httpService: HttpService) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || 'Wholesaler';
    this.itemForm = this.fb.group({ orderId: [''], status: [''] });
    this.loadAll();
  }

  loadAll(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.httpService.getPlacedOrders(userId).subscribe((res: any) => {
      this.placedOrders = res;
      this.applyPlacedFilter();
    });

    this.httpService.getReceivedOrders(userId).subscribe((res: any) => {
      this.receivedOrders = res;
      this.applyReceivedFilter();
    });

    this.httpService.getWholesalerFeedbacks(userId).subscribe({
      next: (res: any) => { this.feedbacks = res; },
      error: () => { console.log('Feedback load failed'); }
    });
  }

  // Filter Logic
  applyPlacedFilter(): void {
    let list = [...this.placedOrders];
    if (this.placedSearch) { 
      const t = this.placedSearch.toLowerCase(); 
      list = list.filter(o => o.product?.name?.toLowerCase().includes(t) || String(o.id).includes(t)); 
    }
    if (this.placedFilterStatus) list = list.filter(o => o.status === this.placedFilterStatus);
    this.placedFiltered = list; 
    this.placedPage = 1;
  }

  applyReceivedFilter(): void {
    let list = [...this.receivedOrders];
    if (this.receivedSearch) { 
      const t = this.receivedSearch.toLowerCase(); 
      list = list.filter(o => o.product?.name?.toLowerCase().includes(t) || String(o.id).includes(t)); 
    }
    if (this.receivedFilterStatus) list = list.filter(o => o.status === this.receivedFilterStatus);
    this.receivedFiltered = list; 
    this.receivedPage = 1;
  }

  // Getters for Paging
  get placedPaged(): any[] { return this.placedFiltered.slice((this.placedPage - 1) * this.pageSize, this.placedPage * this.pageSize); }
  get placedTotalPages(): number { return Math.ceil(this.placedFiltered.length / this.pageSize); }

  get receivedPaged(): any[] { return this.receivedFiltered.slice((this.receivedPage - 1) * this.pageSize, this.receivedPage * this.pageSize); }
  get receivedTotalPages(): number { return Math.ceil(this.receivedFiltered.length / this.pageSize); }

  // Actions
  markReceived(o: any): void {
    this.confirmMsg = `Mark Order #${o.id} as RECEIVED? Inventory will be updated.`;
    this.confirmAction = () => {
      this.httpService.markOrderReceived(o.id, localStorage.getItem('userId')).subscribe({
        next: () => { this.handleSuccess(`Order #${o.id} added to inventory!`); this.loadAll(); },
        error: (err) => this.errorMsg = err.error?.message || 'Update failed.'
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  cancelPlacedOrder(o: any): void {
    this.confirmMsg = `Cancel Order #${o.id}? This will restore stock to the manufacturer.`;
    this.confirmAction = () => {
      this.httpService.cancelWholesalerOrder(o.id).subscribe({
        next: () => { this.handleSuccess(`Order #${o.id} cancelled.`); this.loadAll(); },
        error: (err) => this.errorMsg = err.error?.message || 'Cannot cancel.'
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  private handleSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void { this.showConfirm = false; }
}
