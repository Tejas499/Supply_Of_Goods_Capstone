import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateProductsComponent } from './create-products/create-products.component';

import { PlaceOrderComponent } from './place-order/place-order.component';
import { GetOrdersComponent } from './get-orders/get-orders.component';

import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { ConsumerPlaceOrderComponent } from './consumer-place-order/consumer-place-order.component';
import { ConsumerGetOrdersComponent } from './consumer-get-orders/consumer-get-orders.component';

// ✅ ADD THIS
import { LandingComponent } from './landing/landing.component';

const routes: Routes = [

  // ✅ Landing Page FIRST
  { path: '', component: LandingComponent },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },

  // Dashboard
  { path: 'dashboard', component: DashbaordComponent },

  // Product & Inventory
  { path: 'create-product', component: CreateProductsComponent },
  { path: 'add-inventory', component: AddInventoryComponent },

  // Orders
  { path: 'place-product', component: PlaceOrderComponent },
  { path: 'get-orders', component: GetOrdersComponent },

  // Consumer
  { path: 'consumer-place-order', component: ConsumerPlaceOrderComponent },
  { path: 'consumer-get-orders', component: ConsumerGetOrdersComponent },

  // ❌ REMOVE old redirect
  // { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ✅ Wildcard (fallback)
  { path: '**', redirectTo: '' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }