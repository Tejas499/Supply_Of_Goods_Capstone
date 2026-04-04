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
  userName: string = ''; // Added for greeting
  searchTerm = '';
  successMsg = ''; errorMsg = '';
  editingId: any = null;
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || 'Wholesaler';
    this.itemForm = this.fb.group({
      wholesalerId:  [localStorage.getItem('userId') || ''],
      stockQuantity: ['', [Validators.required, Validators.min(1)]],
      productId:     ['', Validators.required]
    });
    this.loadInventories();
  }

  loadInventories(): void {
    const id = localStorage.getItem('userId');
    if (id) this.httpService.getInventoryByWholesalers(id).subscribe((res: any) => {
      this.inventories = res; 
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.inventories.filter(i => i.product?.name?.toLowerCase().includes(t));
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  
  onSubmit(): void {
    if (this.itemForm.invalid) return;
    this.confirmMsg = this.editingId ? 'Update this inventory record?' : 'Add this new product to inventory?';
    this.confirmAction = () => {
      const id = localStorage.getItem('userId');
      if (this.editingId) {
        this.httpService.updateInventory(this.itemForm.value.stockQuantity, this.editingId).subscribe({
          next: () => this.handleSuccess('Inventory updated successfully!'),
          error: (err) => this.errorMsg = err.error?.message || 'Update failed.'
        });
      } else {
        const details = { wholesalerId: id, stockQuantity: this.itemForm.value.stockQuantity };
        this.httpService.addInventory(details, this.itemForm.value.productId).subscribe({
          next: () => this.handleSuccess('New inventory record added!'),
          error: (err) => this.errorMsg = err.error?.message || 'Add failed.'
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
