import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.scss']
})
export class CreateProductsComponent implements OnInit {
  itemForm!: FormGroup;
  products: any[] = [];
  filtered: any[] = [];
  orders: any[] = [];
  feedbacks: any[] = [];
  searchTerm = '';
  successMsg = ''; errorMsg = '';
  editingId: any = null;
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;
  activeTab = 'products'; // 'products' | 'orders' | 'feedback'

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      manufacturerId: [localStorage.getItem('userId') || ''],
      name:           ['', Validators.required],
      description:    ['', Validators.required],
      price:          ['', Validators.required],
      stockQuantity:  ['', Validators.required]
    });
    this.loadAll();
  }

  loadAll(): void {
    this.loadProducts();
    this.loadOrders();
    this.loadFeedbacks();
  }

  loadProducts(): void {
    const id = localStorage.getItem('userId');
    if (id) this.httpService.getProductsByManufacturer(id).subscribe((res: any) => {
      this.products = res; this.applyFilter();
    });
  }

  loadOrders(): void {
    const id = localStorage.getItem('userId');
    if (id) this.httpService.getManufacturerOrders(id).subscribe({
      next: (res: any) => { this.orders = res.map((o: any) => ({ ...o, selectedStatus: '' })); },
      error: () => {}
    });
  }

  loadFeedbacks(): void {
    const id = localStorage.getItem('userId');
    if (id) this.httpService.getManufacturerFeedbacks(id).subscribe({
      next: (res: any) => { this.feedbacks = res; },
      error: () => {}
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.products.filter(p => p.name?.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t));
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get pages(): number[] { return Array.from({length: this.totalPages}, (_, i) => i+1); }

  editProduct(p: any): void {
    this.editingId = p.id;
    this.itemForm.patchValue({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, manufacturerId: p.manufacturerId });
    this.errorMsg = ''; this.activeTab = 'products';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void { this.editingId = null; this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') }); this.errorMsg = ''; }

  // Manufacturer updates W2M order status: IN PROGRESS or OUT FOR DELIVERY
  updateOrderStatus(o: any): void {
    if (!o.selectedStatus) return;
    this.confirmMsg = `Update Order #${o.id} to "${o.selectedStatus}"?`;
    this.confirmAction = () => {
      this.httpService.updateManufacturerOrderStatus(o.id, o.selectedStatus).subscribe({
        next: () => { this.successMsg = `Order #${o.id} → ${o.selectedStatus}`; this.loadOrders(); setTimeout(() => this.successMsg = '', 4000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Update failed.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;
    if (this.editingId) {
      this.confirmMsg = `Update product "${this.itemForm.value.name}"?`;
      this.confirmAction = () => {
        this.httpService.updateProduct(this.itemForm.value, this.editingId).subscribe({
          next: () => { this.successMsg = 'Product updated!'; this.cancelEdit(); this.loadProducts(); setTimeout(() => this.successMsg = '', 3000); },
          error: (err: any) => { this.errorMsg = err.error?.message || 'Update failed.'; }
        });
        this.showConfirm = false;
      };
      this.showConfirm = true;
    } else {
      this.httpService.createProduct(this.itemForm.value).subscribe({
        next: () => { this.successMsg = 'Product created!'; this.errorMsg = ''; this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') }); this.loadProducts(); setTimeout(() => this.successMsg = '', 3000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Product may already exist.'; }
      });
    }
  }

  deleteProduct(p: any): void {
    this.confirmMsg = `⚠️ Delete "${p.name}"? This removes it from ALL wholesaler inventories permanently.`;
    this.confirmAction = () => {
      this.httpService.deleteProduct(p.id).subscribe({
        next: () => { this.successMsg = `"${p.name}" deleted from all inventories.`; this.loadProducts(); setTimeout(() => this.successMsg = '', 3000); },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Delete failed.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
}