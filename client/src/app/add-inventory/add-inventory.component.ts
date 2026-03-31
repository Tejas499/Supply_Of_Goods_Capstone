import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss']
})
export class AddInventoryComponent implements OnInit {
  itemForm!: FormGroup;
  inventories: any[] = [];
  successMsg: string = '';
  editingId: any = null;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    // private authService: AuthService,
    // private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      wholesalerId: [localStorage.getItem('userId') || ''],
      stockQuantity: ['', Validators.required],
      productId: ['', Validators.required]
    });
    this.loadInventories();
  }

  loadInventories(): void {
    const wholesalerId = localStorage.getItem('userId');
    if (wholesalerId) {
      this.httpService.getInventoryByWholesalers(wholesalerId).subscribe((res) => {
        this.inventories = res;
        console.log(this.inventories);
        
      });
    }
  }

  editInventory(inv: any): void {
    this.editingId = inv.id;
    this.itemForm.patchValue({
      stockQuantity: inv.stockQuantity,
      productId: inv.product?.id
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      if (this.editingId) {
        this.httpService.updateInventory(this.itemForm.value.stockQuantity, this.editingId).subscribe(() => {
          this.successMsg = 'Updated Successfully';
          this.editingId = null;
          this.itemForm.reset({ wholesalerId: localStorage.getItem('userId') });
          this.loadInventories();
          setTimeout(() => this.successMsg = '', 3000);
        });
      } else {
        const productId = this.itemForm.value.productId;
        const details = {
          wholesalerId: this.itemForm.value.wholesalerId,
          stockQuantity: this.itemForm.value.stockQuantity
        };
        this.httpService.addInventory(details, productId).subscribe(() => {
          this.successMsg = 'Save Successfully';
          this.itemForm.reset({ wholesalerId: localStorage.getItem('userId') });
          this.loadInventories();
          setTimeout(() => this.successMsg = '', 3000);
        });
      }
    }
  }
}
