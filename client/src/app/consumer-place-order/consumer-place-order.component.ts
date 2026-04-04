import { Component, OnInit, NgZone } from '@angular/core';
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
  userName: string = '';
  searchTerm = '';
  selectedProduct: any = null;
  showOrderForm = false;
  successMsg = ''; errorMsg = '';
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;

  // PAYMENT
  processingPayment = false;
  paymentSuccess = false;
  paymentError = '';
  showPaymentOptions = false;
  finalAmount = 0;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('username') || 'Customer';
    this.itemForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      productId: ['']
    });
    this.loadProducts();
  }

  loadProducts() {
    this.httpService.getProductsByConsumers().subscribe((res: any) => {
      this.products = res;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.products.filter(p =>
      p.name?.toLowerCase().includes(t) ||
      p.manufacturer?.username?.toLowerCase().includes(t)
    );
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }

  openOrderForm(p: any): void {
    this.selectedProduct = p;
    this.showOrderForm = true;
    this.wholesalers = []; // Clear previous wholesaler view
    this.itemForm.patchValue({ productId: p.id, quantity: '' });
  }

  closeOrderForm(): void {
    this.showOrderForm = false;
    this.selectedProduct = null;
    this.itemForm.reset();
  }

  onSubmit(): void {
    if (this.itemForm.invalid || !this.selectedProduct) return;
    this.finalAmount = this.itemForm.value.quantity * this.selectedProduct.price;
    this.confirmMsg = `Order ${this.itemForm.value.quantity} × ${this.selectedProduct.name} for ₹${this.finalAmount}?`;
    this.confirmAction = () => {
      this.showConfirm = false;
      this.showPaymentOptions = true;
    };
    this.showConfirm = true;
  }

  placeOrder() {
    const userId = localStorage.getItem('userId');
    const details = { quantity: this.itemForm.value.quantity, status: 'ORDER PLACED' };
    this.httpService.consumerPlaceOrder(details, this.selectedProduct.id, userId).subscribe({
      next: () => this.loadProducts(),
      error: (err: any) => this.errorMsg = err.error?.message || 'Order failed'
    });
  }

  payNow() {
    if (!(window as any).Razorpay) { this.paymentError = "Razorpay SDK not loaded"; return; }
    this.processingPayment = true;
    fetch(`${this.httpService.serverName}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: this.finalAmount })
    })
    .then(res => res.json())
    .then(order => {
      const options = {
        key: 'rzp_test_SYteb3DnWa7SY9',
        amount: order.amount,
        currency: 'INR',
        order_id: order.id,
        handler: (response: any) => {
          this.ngZone.run(() => {
            this.processingPayment = false;
            this.placeOrder();
            this.paymentSuccess = true;
            this.successMsg = "Payment successful & Order placed!";
            this.showPaymentOptions = false;
            setTimeout(() => { this.paymentSuccess = false; this.successMsg = ''; this.closeOrderForm(); }, 4000);
          });
        },
        modal: { ondismiss: () => this.ngZone.run(() => this.processingPayment = false) }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    }).catch(() => this.ngZone.run(() => { this.processingPayment = false; this.paymentError = "Payment failed"; }));
  }

  confirmWithCOD() {
    this.placeOrder();
    this.successMsg = "Order placed with Cash on Delivery";
    this.showPaymentOptions = false;
    setTimeout(() => { this.successMsg = ''; this.closeOrderForm(); }, 4000);
  }

  viewWholesalers(p: any): void {
    this.selectedProduct = p;
    this.showOrderForm = false; // Close form if viewing list
    this.httpService.getWholesalersForProduct(p.id).subscribe((res: any) => this.wholesalers = res);
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void { this.showConfirm = false; }
}
