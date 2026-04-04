import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateProductsComponent } from './create-products/create-products.component';
import { PlaceOrderComponent } from './place-order/place-order.component';
import { GetOrdersComponent } from './get-orders/get-orders.component';
import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { ConsumerPlaceOrderComponent } from './consumer-place-order/consumer-place-order.component';
import { ConsumerGetOrdersComponent } from './consumer-get-orders/consumer-get-orders.component';

import { HttpService } from '../services/http.service';
import { AuthInterceptor } from './auth.interceptor';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    DashbaordComponent,
    CreateProductsComponent,
    PlaceOrderComponent,
    GetOrdersComponent,
    AddInventoryComponent,
    ConsumerPlaceOrderComponent,
    ConsumerGetOrdersComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    HttpService,
    // Intercepts every HTTP response — auto-logout on 401
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }