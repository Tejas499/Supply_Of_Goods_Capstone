import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {
  itemForm!: FormGroup;
  userName: string = '';
  
  products: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  successMsg = ''; 
  errorMsg = '';
  
  showOrderForm = false;
  selectedProduct: any = null;
  showConfirm = false; 
  confirmMsg = ''; 
  confirmAction: any = null;
  totalPrice: number = 0;

  // Pagination
  page = 1; 
  pageSize = 6;

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || 'Wholesaler';
    this.itemForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      productId: ['']
    });
    this.loadProducts();
  }

  loadProducts() {
    this.httpService.getProductsByWholesaler().subscribe((res: any) => {
      this.products = res; 
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.products.filter(p =>
      p.name?.toLowerCase().includes(t) || p.manufacturer?.username?.toLowerCase().includes(t)
    );
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }

  openOrderForm(p: any): void {
    this.selectedProduct = p;
    this.showOrderForm = true;
    this.itemForm.patchValue({ productId: p.id, quantity: 1 });
    this.calculateTotal();
    this.errorMsg = ''; 
    this.successMsg = '';
  }

  calculateTotal() {
    if (this.selectedProduct) {
      this.totalPrice = this.itemForm.value.quantity * this.selectedProduct.price;
    }
  }

  closeOrderForm(): void { 
    this.showOrderForm = false; 
    this.selectedProduct = null; 
    this.itemForm.reset();
  }

  onSubmit(): void {
    if (this.itemForm.invalid || !this.selectedProduct) return;
    
    this.calculateTotal();
    this.confirmMsg = `Confirm procurement of ${this.itemForm.value.quantity} × ${this.selectedProduct.name} for ₹${this.totalPrice}?`;
    
    this.confirmAction = () => {
      const userId = localStorage.getItem('userId');
      const details = { quantity: this.itemForm.value.quantity, status: 'ORDER PLACED' };
      
      this.httpService.placeOrder(details, this.selectedProduct.id, userId).subscribe({
        next: () => {
          this.successMsg = '✅ Procurement order placed successfully!';
          this.showOrderForm = false;
          this.loadProducts();
          setTimeout(() => this.successMsg = '', 4000);
        },
        error: (err: any) => { 
          this.errorMsg = err.error?.message || 'Stock limit exceeded.'; 
        }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }
}
