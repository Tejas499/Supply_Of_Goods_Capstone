import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-consumer-get-orders',
  templateUrl: './consumer-get-orders.component.html',
  styleUrls: ['./consumer-get-orders.component.scss'],
  providers: [DatePipe]
})
export class ConsumerGetOrdersComponent implements OnInit {
  itemForm!: FormGroup;
  orders: any[] = [];
  filtered: any[] = [];
  searchTerm = ''; filterStatus = '';
  successMsg = ''; errorMsg = '';
  showFeedbackFor: any = null;
  showConfirm = false; confirmMsg = ''; confirmAction: any = null;
  page = 1; pageSize = 5;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.itemForm = this.fb.group({
      orderId:   [''],
      userId:    [userId || '', Validators.required],
      content:   ['', [Validators.required, Validators.minLength(3)]],
      timestamp: [this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')]
    });
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.httpService.getOrderConsumer(userId).subscribe((res: any) => {
        this.orders = res;
        this.applyFilter();
      });
    }
  }

  applyFilter(): void {
    let list = [...this.orders];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(o => o.product?.name?.toLowerCase().includes(t));
    }
    if (this.filterStatus) list = list.filter(o => o.status === this.filterStatus);
    this.filtered = list;
    this.page = 1;
  }

  get paged(): any[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  // Feedback only available when wholesaler has marked order as DELIVERED
  canLeaveFeedback(o: any): boolean {
    return o.status === 'DELIVERED';
  }

  // Cancel only when ORDER PLACED (before wholesaler starts processing)
  canCancel(o: any): boolean {
    return o.status === 'ORDER PLACED';
  }

  openFeedback(o: any): void {
    this.showFeedbackFor = o;
    this.itemForm.patchValue({
      orderId: o.id,
      content: '',
      timestamp: this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')
    });
    this.errorMsg = '';
  }

  cancelOrder(o: any): void {
    this.confirmMsg = `Cancel your order for "${o.product?.name}"? Stock will be restored.`;
    this.confirmAction = () => {
      // Use the correct CONSUMER cancel endpoint
      this.httpService.cancelConsumerOrder(o.id).subscribe({
        next: () => {
          this.successMsg = `Order for "${o.product?.name}" cancelled successfully.`;
          this.loadOrders();
          setTimeout(() => this.successMsg = '', 4000);
        },
        error: (err: any) => {
          this.errorMsg = err.error?.message || 'Cannot cancel this order.';
        }
      });
      this.showConfirm = false;
    };
    this.showConfirm = true;
  }
  markReceived(o: any): void {
  const userId = localStorage.getItem('userId');
  if (!confirm("Mark this order as received?")) return;

  this.httpService.markConsumerOrderReceived(o.id, userId).subscribe({
    next: () => {
      this.successMsg = "Order marked as delivered";
      this.loadOrders();
      setTimeout(() => this.successMsg = '', 3000);
    },
    error: (err: any) => {
      this.errorMsg = err.error?.message || "Failed to update";
    }
  });
}

  onSubmit(): void {
    if (this.itemForm.invalid) return;
    const { orderId, userId, content, timestamp } = this.itemForm.value;
    this.httpService.addConsumerFeedBack(orderId, userId, { content, timestamp }).subscribe({
      next: () => {
        this.successMsg = 'Feedback submitted! Thank you.';
        this.showFeedbackFor = null;
        this.itemForm.patchValue({ content: '' });
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Failed to submit feedback.';
      }
    });
  }

  onConfirm(): void { if (this.confirmAction) this.confirmAction(); }
  onCancel(): void  { this.showConfirm = false; }

  // ── PDF Invoice ──────────────────────────────────────
  generateInvoice(o: any): void {
    const consumerName  = localStorage.getItem('username') || 'Consumer';
    const consumerEmail = localStorage.getItem('email')    || '';
    const invoiceNo     = `INV-${o.id}-${Date.now().toString().slice(-6)}`;
    const orderDate     = this.datePipe.transform(new Date(), 'dd MMM yyyy') || '';
    const unitPrice     = o.product?.price || 0;
    const qty           = o.quantity || 0;
    const total         = unitPrice * qty;
    const gst           = +(total * 0.18).toFixed(2);
    const grandTotal    = +(total + gst).toFixed(2);

    const mfr  = o.product?.manufacturer;
    const wsl  = o.wholesaler || null;   // may not be present in payload

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNo}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #12343B; background:#fff; padding: 48px; font-size: 13px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #12343B; padding-bottom: 24px; margin-bottom: 28px; }
    .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #12343B; }
    .logo span { color: #E1B382; }
    .inv-meta { text-align:right; }
    .inv-meta h2 { font-size: 22px; font-weight: 800; color: #12343B; letter-spacing: 1px; }
    .inv-meta p { color: #8A9FA4; font-size: 12px; margin-top: 4px; }
    .parties { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .party h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #8A9FA4; margin-bottom: 8px; font-weight: 700; }
    .party p  { font-size: 13px; color: #12343B; line-height: 1.7; }
    .party strong { font-size: 14px; font-weight: 700; color: #12343B; display:block; margin-bottom: 2px; }
    table { width:100%; border-collapse: collapse; margin-bottom: 28px; }
    thead tr { background: #12343B; color: #fff; }
    thead th { padding: 12px 16px; text-align:left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
    tbody td { padding: 14px 16px; border-bottom: 1px solid #EAF0F1; font-size: 13px; }
    tbody tr:last-child td { border-bottom: none; }
    .totals { display:flex; justify-content:flex-end; }
    .totals-box { width: 260px; }
    .totals-row { display:flex; justify-content:space-between; padding: 7px 0; font-size: 13px; border-bottom: 1px solid #EAF0F1; }
    .totals-row.grand { border-top: 2px solid #12343B; border-bottom: none; margin-top: 4px; padding-top: 10px; font-weight: 800; font-size: 15px; color: #12343B; }
    .status-badge { display:inline-block; padding: 4px 12px; border-radius: 50px; background: rgba(16,185,129,0.12); color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #EAF0F1; display:flex; justify-content:space-between; align-items:center; color: #8A9FA4; font-size: 11px; }
    .note { margin-top: 24px; background: rgba(225,179,130,0.1); border-left: 3px solid #E1B382; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 12px; color: #78350F; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="logo">FL<span style="color: yellow">O</span>W</div>
      <p style="color:#8A9FA4;font-size:11px;margin-top:6px;">Supply Chain Management Platform</p>
    </div>
    <div class="inv-meta">
      <h2>INVOICE</h2>
      <p>${invoiceNo}</p>
      <p>Date: ${orderDate}</p>
      <p style="margin-top:8px;"><span class="status-badge">${o.status}</span></p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h4>Bill To (Consumer)</h4>
      <strong>${consumerName}</strong>
      <p>${consumerEmail}</p>
    </div>
    <div class="party">
      <h4>Manufacturer</h4>
      <strong>${mfr?.username || 'N/A'}</strong>
      <p>${mfr?.email || ''}</p>
      <p style="color:#8A9FA4;font-size:11px;margin-top:2px;">Role: Manufacturer</p>
    </div>
    <div class="party">
      <h4>Fulfilled By (Wholesaler)</h4>
      <strong>${o.product?.manufacturer?.username || 'LogiTrack Network'}</strong>
      <p style="color:#8A9FA4;font-size:11px;">Verified supply partner</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th>Description</th>
        <th>Unit Price</th>
        <th>Qty</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>${o.product?.name || 'Product'}</strong></td>
        <td style="color:#8A9FA4">${o.product?.description || '—'}</td>
        <td>₹${unitPrice.toLocaleString('en-IN')}</td>
        <td>${qty}</td>
        <td><strong>₹${total.toLocaleString('en-IN')}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>₹${total.toLocaleString('en-IN')}</span></div>
      <div class="totals-row"><span>GST (18%)</span><span>₹${gst.toLocaleString('en-IN')}</span></div>
      <div class="totals-row"><span>Shipping</span><span>FREE</span></div>
      <div class="totals-row grand"><span>Grand Total</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
    </div>
  </div>

  <div class="note">
    ✅ This is a computer-generated invoice. No signature required.
    Payment via Razorpay / Cash on Delivery as selected at checkout.
  </div>

  <div class="footer">
    <span>© ${new Date().getFullYear()} LogiTrack Inc. — A Larsen &amp; Toubro Group Project</span>
    <span>Order #${o.id} | Generated ${orderDate}</span>
  </div>

</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 600);
    }
  }
}