import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-consumer-place-order',
  templateUrl: './consumer-place-order.component.html',
  styleUrls: ['./consumer-place-order.component.scss']
})
export class ConsumerPlaceOrderComponent implements OnInit {
  itemForm!: FormGroup;
  products: any[] = [];
  filtered: any[] = [];
  wholesalers: any[] = [];
  searchTerm = '';
  selectedProduct: any = null;
  showOrderForm = false;
  successMsg = ''; errorMsg = '';
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      productId: ['']
    });
    this.httpService.getProductsByConsumers().subscribe((res: any) => {
      this.products = res; this.applyFilter();
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.products.filter(p =>
      p.name?.toLowerCase().includes(t) || p.manufacturer?.username?.toLowerCase().includes(t)
    );
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get pages(): number[] { return Array.from({length: this.totalPages}, (_, i) => i+1); }

  viewWholesalers(p: any): void {
    this.selectedProduct = p; this.wholesalers = [];
    this.httpService.getWholesalersForProduct(p.id).subscribe((res: any) => { this.wholesalers = res; });
  }

  openOrderForm(p: any): void {
    this.selectedProduct = p; this.showOrderForm = true;
    this.itemForm.patchValue({ productId: p.id, quantity: '' });
    this.errorMsg = ''; this.successMsg = '';
  }

  closeOrderForm(): void { this.showOrderForm = false; this.selectedProduct = null; }

  onSubmit(): void {
    if (this.itemForm.invalid || !this.selectedProduct) return;
    this.confirmMsg = `Order ${this.itemForm.value.quantity} × ${this.selectedProduct.name} for ₹${(this.itemForm.value.quantity * this.selectedProduct.price).toLocaleString('en-IN')}?`;
    this.confirmAction = () => {
      const userId = localStorage.getItem('userId');
      const details = { quantity: this.itemForm.value.quantity, status: 'ORDER PLACED' };
      this.httpService.consumerPlaceOrder(details, this.selectedProduct.id, userId).subscribe({
        next: () => {
          this.successMsg = '✅ Order placed!'; this.errorMsg = '';
          this.showOrderForm = false; this.selectedProduct = null;
          this.itemForm.reset();
          this.httpService.getProductsByConsumers().subscribe((res: any) => { this.products = res; this.applyFilter(); });
          setTimeout(() => this.successMsg = '', 4000);
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Insufficient stock.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
}
