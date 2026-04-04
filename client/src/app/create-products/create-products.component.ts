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
  userName: string = '';
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
    this.userName = localStorage.getItem('username') || 'Manufacturer';
    this.itemForm = this.fb.group({
      manufacturerId: [localStorage.getItem('userId') || ''],
      name:           ['', Validators.required],
      description:    ['', Validators.required],
      price:          ['', [Validators.required, Validators.min(1)]],
      stockQuantity:  ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]+$")]]
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
      next: (res: any) => { this.orders = res.map((o: any) => ({ ...o, selectedStatus: '' })); }
    });
  }

  loadFeedbacks(): void {
    const id = localStorage.getItem('userId');
    if (id) this.httpService.getManufacturerFeedbacks(id).subscribe({
      next: (res: any) => { this.feedbacks = res; }
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.products.filter(p => p.name?.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t));
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }

  editProduct(p: any): void {
    this.editingId = p.id;
    this.itemForm.patchValue({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, manufacturerId: p.manufacturerId });
    this.activeTab = 'products';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void { 
    this.editingId = null; 
    this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') }); 
  }

  updateOrderStatus(o: any): void {
    if (!o.selectedStatus) return;
    this.confirmMsg = `Move Order #${o.id} to status: ${o.selectedStatus}?`;
    this.confirmAction = () => {
      this.httpService.updateManufacturerOrderStatus(o.id, o.selectedStatus).subscribe({
        next: () => { 
          this.successMsg = `Order status updated!`; 
          this.loadOrders(); 
          setTimeout(() => this.successMsg = '', 3000); 
        },
        error: (err: any) => this.errorMsg = err.error?.message || 'Update failed.'
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;
    if (this.editingId) {
      this.confirmMsg = `Update product details for "${this.itemForm.value.name}"?`;
      this.confirmAction = () => {
        this.httpService.updateProduct(this.itemForm.value, this.editingId).subscribe({
          next: () => { this.successMsg = 'Changes saved!'; this.cancelEdit(); this.loadProducts(); setTimeout(() => this.successMsg = '', 3000); }
        });
        this.showConfirm = false;
      };
      this.showConfirm = true;
    } else {
      this.httpService.createProduct(this.itemForm.value).subscribe({
        next: () => { 
          this.successMsg = 'New product listed!'; 
          this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') }); 
          this.loadProducts(); 
          setTimeout(() => this.successMsg = '', 3000); 
        }
      });
    }
  }

  deleteProduct(p: any): void {
    this.confirmMsg = `⚠️ Delete "${p.name}"? This is permanent.`;
    this.confirmAction = () => {
      this.httpService.deleteProduct(p.id).subscribe({
        next: () => { this.successMsg = 'Product removed.'; this.loadProducts(); setTimeout(() => this.successMsg = '', 3000); }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
}
