import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.scss']
})
export class CreateProductsComponent implements OnInit {
  itemForm!: FormGroup;
  products: any[] = [];
  filtered: any[] = [];
  searchTerm: string = '';
  successMsg = ''; errorMsg = '';
  editingId: any = null;
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;

  // Pagination
  page = 1; pageSize = 5;

  constructor(private fb: FormBuilder, private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      manufacturerId: [localStorage.getItem('userId') || ''],
      name:           ['', Validators.required],
      description:    ['', Validators.required],
      price:          ['', Validators.required],
      stockQuantity:  ['', Validators.required]
    });
    this.loadProducts();
  }

  loadProducts(): void {
    const id = localStorage.getItem('userId');
    if (id) this.httpService.getProductsByManufacturer(id).subscribe((res: any) => {
      this.products = res; this.applyFilter();
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.products.filter(p =>
     ( p.name?.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t)) && p.stockQuantity!==0
    );
    this.page = 1;
  }

  get paged(): any[] {
    const s = (this.page - 1) * this.pageSize;
    return this.filtered.slice(s, s + this.pageSize);
  }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get pages(): number[] { return Array.from({length: this.totalPages}, (_, i) => i + 1); }

  editProduct(p: any): void {
    this.editingId = p.id;
    this.itemForm.patchValue({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, manufacturerId: p.manufacturerId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void { this.editingId = null; this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') }); }

  confirmDelete(p: any): void {
    this.confirmMsg = `Delete product "${p.name}"? This cannot be undone.`;
    this.confirmAction = () => { this.doDelete(p); };
    this.showConfirm = true;
  }

  doDelete(p: any): void {
    // Mark as deleted by setting stock to 0 (no delete endpoint — workaround)
    const updated = { ...p, stockQuantity: 0, description: p.description };
    this.httpService.updateProduct(updated, p.id).subscribe(() => {
      this.successMsg = `Product "${p.name}" removed.`;
      this.loadProducts();
      setTimeout(() => this.successMsg = '', 3000);
    });
    this.showConfirm = false;
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; this.confirmAction = null; }

  onSubmit(): void {
    if (this.itemForm.invalid) return;
    if (this.editingId) {
      this.confirmMsg = 'Update this product?';
      this.confirmAction = () => {
        this.httpService.updateProduct(this.itemForm.value, this.editingId).subscribe(() => {
          this.successMsg = 'Product updated!'; this.editingId = null;
          this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') });
          this.loadProducts(); setTimeout(() => this.successMsg = '', 3000);
        });
        this.showConfirm = false;
      };
      this.showConfirm = true;
    } else {
      this.httpService.createProduct(this.itemForm.value).subscribe(() => {
        this.successMsg = 'Product created!';
        this.itemForm.reset({ manufacturerId: localStorage.getItem('userId') });
        this.loadProducts(); setTimeout(() => this.successMsg = '', 3000);
      });
    }
  }
}