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

import { AuthGuard } from './auth.guard';
import { LandingComponent } from './landing/landing.component';
import { IntroAnimationComponent } from './intro-animation/intro-animation.component';
// import { NoAuthGuard } from './auth.guard';

const routes: Routes = [

  {path:'',
    component:IntroAnimationComponent
  },

  // ✅ DEFAULT PATH → Landing Component
  {
    path: 'landing',
    component: LandingComponent,
    pathMatch: 'full'
  },

  // Public (no-auth)
  {
    path: 'login',
    component: LoginComponent,

  },
  {
    path: 'registration',
    component: RegistrationComponent,

  },

  // Protected
  {
    path: 'dashboard',
    component: DashbaordComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'create-product',
    component: CreateProductsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MANUFACTURER'] }
  },

  {
    path: 'place-product',
    component: PlaceOrderComponent,
    canActivate: [AuthGuard],
    data: { roles: ['WHOLESALER'] }
  },

  {
    path: 'add-inventory',
    component: AddInventoryComponent,
    canActivate: [AuthGuard],
    data: { roles: ['WHOLESALER'] }
  },

  {
    path: 'get-orders',
    component: GetOrdersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MANUFACTURER', 'WHOLESALER'] }
  },

  {
    path: 'consumer-place-order',
    component: ConsumerPlaceOrderComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CONSUMER'] }
  },

  {
    path: 'consumer-get-orders',
    component: ConsumerGetOrdersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CONSUMER'] }
  },

  // ✅ Wildcard → back to landing
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
})],
  exports: [RouterModule],
})
export class AppRoutingModule { }