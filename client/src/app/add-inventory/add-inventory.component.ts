import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss']
})
export class AddInventoryComponent implements OnInit {
  itemForm!: FormGroup;
  inventories: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  successMsg = ''; errorMsg = '';
  userName = '';
  editingId: any = null;
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;

  // ── Low stock alert ─────────────────────────────────
  LOW_STOCK_THRESHOLD = 10;
  get lowStockItems(): any[] {
    return this.inventories.filter(i => i.stockQuantity <= this.LOW_STOCK_THRESHOLD && i.stockQuantity >= 0);
  }
  get hasLowStock(): boolean { return this.lowStockItems.length > 0; }
  dismissedAlert = false;

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || 'Wholesaler';
    this.itemForm = this.fb.group({
      wholesalerId:  [localStorage.getItem('userId') || ''],
      stockQuantity: ['', Validators.required],
      productId:     ['', Validators.required]
    });
    this.loadInventories();
  }

  loadInventories(): void {
    const id = localStorage.getItem('userId');
    if (id) this.httpService.getInventoryByWholesalers(id).subscribe((res: any) => {
      this.inventories = res; this.applyFilter();
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.inventories.filter(i => i.product?.name?.toLowerCase().includes(t));
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get pages(): number[] { return Array.from({length: this.totalPages}, (_, i) => i+1); }

  editInventory(inv: any): void {
    this.editingId = inv.id;
    this.itemForm.patchValue({ stockQuantity: inv.stockQuantity, productId: inv.product?.name });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void { this.editingId = null; this.itemForm.reset({ wholesalerId: localStorage.getItem('userId') }); }

  onSubmit(): void {
    if (this.itemForm.invalid) return;
    this.confirmMsg = this.editingId ? 'Update inventory stock?' : 'Add this inventory record?';
    this.confirmAction = () => {
      if (this.editingId) {
        this.httpService.updateInventory(this.itemForm.value.stockQuantity, this.editingId).subscribe({
          next: () => { this.successMsg = 'Inventory updated!'; this.editingId = null; this.itemForm.reset({ wholesalerId: localStorage.getItem('userId') }); this.loadInventories(); setTimeout(() => this.successMsg = '', 3000); },
          error: (err: any) => { this.errorMsg = err.error?.message || 'Update failed.'; }
        });
      } else {
        const details = { wholesalerId: this.itemForm.value.wholesalerId, stockQuantity: this.itemForm.value.stockQuantity };
        this.httpService.addInventory(details, this.itemForm.value.productId).subscribe({
          next: () => { this.successMsg = 'Inventory added!'; this.itemForm.reset({ wholesalerId: localStorage.getItem('userId') }); this.loadInventories(); setTimeout(() => this.successMsg = '', 3000); },
          error: (err: any) => { this.errorMsg = err.error?.message || 'Add failed.'; }
        });
      }
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  private handleSuccess(msg: string) {
    this.successMsg = msg;
    this.editingId = null;
    this.itemForm.reset({ wholesalerId: localStorage.getItem('userId') });
    this.loadInventories();
    setTimeout(() => this.successMsg = '', 3000);
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
}