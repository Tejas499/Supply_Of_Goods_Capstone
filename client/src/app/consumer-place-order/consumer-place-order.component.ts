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
  searchTerm = '';

  // Step 1: product selected → show wholesalers
  selectedProduct: any = null;
  wholesalers: any[] = [];

  // Step 2: wholesaler selected → show order form
  selectedWholesaler: any = null;
  showOrderForm = false;

  successMsg = '';
  errorMsg = '';
  showConfirm = false;
  confirmMsg = '';
  confirmAction: any = null;

  page = 1;
  pageSize = 5;

  // Payment
  processingPayment: boolean = false;
  paymentSuccess: boolean = false;
  paymentError: string = '';
  showPaymentOptions = false;
  finalAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]]
    });
    this.loadProducts();
  }

  // ================= LOAD =================
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

  get paged(): any[] {
    return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ================= STEP 1: Select Product → Load Wholesalers =================
  selectProduct(p: any): void {
    this.selectedProduct = p;
    this.selectedWholesaler = null;
    this.showOrderForm = false;
    this.wholesalers = [];
    this.errorMsg = '';
    this.successMsg = '';

    this.httpService.getWholesalersForProduct(p.id).subscribe((res: any) => {
      // Filter out wholesalers with 0 stock
      this.wholesalers = res.filter((w: any) => w.stockQuantity > 0);
      if (this.wholesalers.length === 0) {
        this.errorMsg = 'No wholesalers currently have this product in stock.';
      }
    });
  }

  // ================= STEP 2: Select Wholesaler → Show Order Form =================
  selectWholesaler(w: any): void {
    this.selectedWholesaler = w;
    this.showOrderForm = true;
    this.itemForm.reset();
    this.errorMsg = '';
    this.successMsg = '';
  }

  // ================= RESET / BACK =================
  closeSidePanel(): void {
    this.selectedProduct = null;
    this.selectedWholesaler = null;
    this.wholesalers = [];
    this.showOrderForm = false;
    this.itemForm.reset();
    this.errorMsg = '';
    this.successMsg = '';
  }

  backToWholesalers(): void {
    this.selectedWholesaler = null;
    this.showOrderForm = false;
    this.itemForm.reset();
    this.errorMsg = '';
  }

  // ================= ORDER FLOW =================
  onSubmit(): void {
    if (this.itemForm.invalid || !this.selectedProduct || !this.selectedWholesaler) return;

    const qty = this.itemForm.value.quantity;
    if (qty > this.selectedWholesaler.stockQuantity) {
      this.errorMsg = `Only ${this.selectedWholesaler.stockQuantity} units available from this wholesaler.`;
      return;
    }

    this.finalAmount = qty * this.selectedProduct.price;
    this.confirmMsg =
      `Order ${qty} × ${this.selectedProduct.name} from ${this.selectedWholesaler.wholesaler?.username} for ₹${this.finalAmount}?`;
    this.confirmAction = () => {
      this.showConfirm = false;
      this.showPaymentOptions = true;
    };
    this.showConfirm = true;
  }

  // ================= PLACE ORDER =================
  placeOrder() {
    const userId = localStorage.getItem('userId');
    const wholesalerId = this.selectedWholesaler.wholesalerId;
    const details = {
      quantity: this.itemForm.value.quantity,
      status: 'ORDER PLACED'
    };
    this.httpService.consumerPlaceOrder(details, this.selectedProduct.id, userId, wholesalerId)
      .subscribe({
        next: () => {
          this.loadProducts();
          // Refresh wholesaler list for this product too
          this.httpService.getWholesalersForProduct(this.selectedProduct.id).subscribe((res: any) => {
            this.wholesalers = res.filter((w: any) => w.stockQuantity > 0);
          });
        },
        error: (err: any) => {
          this.errorMsg = err.error?.message || 'Order failed';
        }
      });
  }

  // ================= PAYMENT =================
  payNow() {
    if (!(window as any).Razorpay) {
      this.paymentError = 'Razorpay SDK not loaded';
      return;
    }
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
              this.successMsg = '✅ Payment successful & Order placed!';
              this.showPaymentOptions = false;
              setTimeout(() => {
                this.paymentSuccess = false;
                this.successMsg = '';
                this.closeSidePanel();
              }, 4000);
            });
          },
          modal: {
            ondismiss: () => {
              this.ngZone.run(() => { this.processingPayment = false; });
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.processingPayment = false;
          this.paymentError = 'Payment failed';
        });
      });
  }

  // ================= COD =================
  confirmWithCOD() {
    this.placeOrder();
    this.successMsg = '💵 Order placed with Cash on Delivery';
    this.showPaymentOptions = false;
    setTimeout(() => {
      this.successMsg = '';
      this.closeSidePanel();
    }, 4000);
  }

  // ================= MODAL =================
  onConfirm(): void {
    if (this.confirmAction) this.confirmAction();
  }

  onCancel(): void {
    this.showConfirm = false;
  }
}