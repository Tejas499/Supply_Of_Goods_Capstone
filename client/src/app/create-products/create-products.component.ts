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
  userName = '';
  orders: any[] = [];
  feedbacks: any[] = [];
  searchTerm = '';
  successMsg = ''; errorMsg = '';
  editingId: any = null;
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 6;          // 6 looks nicer in card grid
  activeTab = 'products';

  // ── Multi-select delete ──────────────────────────────
  selectedIds: Set<number> = new Set();
  get selectionCount(): number { return this.selectedIds.size; }
  get allPageSelected(): boolean {
    return this.paged.length > 0 && this.paged.every(p => this.selectedIds.has(p.id));
  }

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || 'Manufacturer';
    this.itemForm = this.fb.group({
      manufacturerId: [localStorage.getItem('userId') || ''],
      name:           ['', Validators.required],
      description:    ['', Validators.required],
      price:          ['', [Validators.required, Validators.min(1)]],
      stockQuantity:  ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]]
    });
    this.loadAll();
  }

  loadAll(): void { this.loadProducts(); this.loadOrders(); this.loadFeedbacks(); }

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
    this.filtered = this.products.filter(p =>
      p.name?.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t)
    );
    this.page = 1;
    this.selectedIds.clear();   // clear selection on filter change
  }

  get paged(): any[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }

  // ── Edit ────────────────────────────────────────────
  editProduct(p: any): void {
    this.editingId = p.id;
    this.itemForm.patchValue({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, manufacturerId: p.manufacturerId });
    this.errorMsg = ''; this.activeTab = 'products';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') });
    this.errorMsg = '';
  }

  // ── Single delete ────────────────────────────────────
  deleteProduct(p: any): void {
    this.confirmMsg = `⚠️ Delete "${p.name}"? This removes it from ALL wholesaler inventories permanently.`;
    this.confirmAction = () => {
      this.httpService.deleteProduct(p.id).subscribe({
        next: () => {
          this.successMsg = `"${p.name}" deleted.`;
          this.selectedIds.delete(p.id);
          this.loadProducts();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Delete failed.'; }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  // ── Multi-select helpers ─────────────────────────────
  toggleSelect(id: number): void {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  toggleSelectAll(): void {
    if (this.allPageSelected) {
      this.paged.forEach(p => this.selectedIds.delete(p.id));
    } else {
      this.paged.forEach(p => this.selectedIds.add(p.id));
    }
  }

  clearSelection(): void { this.selectedIds.clear(); }

  // ── Multi delete ─────────────────────────────────────
  deleteSelected(): void {
    const count = this.selectedIds.size;
    this.confirmMsg = `⚠️ Permanently delete ${count} product${count > 1 ? 's' : ''}? They will be removed from ALL wholesaler inventories.`;
    this.confirmAction = () => {
      this.showConfirm = false;
      const ids = Array.from(this.selectedIds);
      let completed = 0;
      let failed = 0;
      ids.forEach(id => {
        this.httpService.deleteProduct(id).subscribe({
          next: () => {
            completed++;
            if (completed + failed === ids.length) {
              this.selectedIds.clear();
              this.loadProducts();
              this.successMsg = `${completed} product${completed > 1 ? 's' : ''} deleted successfully.`;
              if (failed > 0) this.errorMsg = `${failed} deletion(s) failed.`;
              setTimeout(() => { this.successMsg = ''; this.errorMsg = ''; }, 3500);
            }
          },
          error: () => {
            failed++;
            if (completed + failed === ids.length) {
              this.selectedIds.clear();
              this.loadProducts();
              if (completed > 0) this.successMsg = `${completed} product${completed > 1 ? 's' : ''} deleted.`;
              this.errorMsg = `${failed} deletion(s) failed.`;
              setTimeout(() => { this.successMsg = ''; this.errorMsg = ''; }, 3500);
            }
          }
        });
      });
    };
    this.showConfirm = true;
  }

  // ── Orders ──────────────────────────────────────────
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

  // ── Submit ──────────────────────────────────────────
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
        next: () => {
          this.successMsg = 'Product created!'; this.errorMsg = '';
          this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') });
          this.loadProducts();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: (err: any) => { this.errorMsg = err.error?.message || 'Product may already exist.'; }
      });
    }
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
}