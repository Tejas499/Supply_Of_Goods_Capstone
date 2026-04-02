import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class HttpService {
  public serverName = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private h(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // ── MANUFACTURER ─────────────────────────────────────────────
  getProductsByManufacturer(mId: any): Observable<any>   { return this.http.get(`${this.serverName}/api/manufacturers/products?manufacturerId=${mId}`, { headers: this.h() }); }
  createProduct(d: any): Observable<any>                 { return this.http.post(`${this.serverName}/api/manufacturers/product`, d, { headers: this.h() }); }
  updateProduct(d: any, pId: any): Observable<any>       { return this.http.put(`${this.serverName}/api/manufacturers/product/${pId}`, d, { headers: this.h() }); }
  deleteProduct(pId: any): Observable<any>               { return this.http.delete(`${this.serverName}/api/manufacturers/product/${pId}`, { headers: this.h() }); }
  getManufacturerOrders(mId: any): Observable<any>       { return this.http.get(`${this.serverName}/api/manufacturers/orders?manufacturerId=${mId}`, { headers: this.h() }); }
  updateManufacturerOrderStatus(id: any, s: any): Observable<any> { return this.http.put(`${this.serverName}/api/manufacturers/order/${id}?status=${s}`, null, { headers: this.h() }); }
  getManufacturerFeedbacks(mId: any): Observable<any>    { return this.http.get(`${this.serverName}/api/manufacturers/feedbacks?manufacturerId=${mId}`, { headers: this.h() }); }

  // ── WHOLESALER ───────────────────────────────────────────────
  getProductsByWholesaler(): Observable<any>              { return this.http.get(`${this.serverName}/api/wholesalers/products`, { headers: this.h() }); }
  // Placed orders (W2M) — wholesaler placed to manufacturer
  getPlacedOrders(userId: any): Observable<any>          { return this.http.get(`${this.serverName}/api/wholesalers/orders/placed?userId=${userId}`, { headers: this.h() }); }
  // Received orders (C2W) — consumer placed to this wholesaler
  getReceivedOrders(userId: any): Observable<any>        { return this.http.get(`${this.serverName}/api/wholesalers/orders/received?userId=${userId}`, { headers: this.h() }); }
  placeOrder(d: any, pId: any, uId: any): Observable<any>{ return this.http.post(`${this.serverName}/api/wholesalers/order?productId=${pId}&userId=${uId}`, d, { headers: this.h() }); }
  updateOrderStatus(id: any, s: any): Observable<any>    { return this.http.put(`${this.serverName}/api/wholesalers/order/${id}?status=${s}`, null, { headers: this.h() }); }
  // Mark W2M order as received → DELIVERED + adds to inventory
  markOrderReceived(id: any, wholesalerId: any): Observable<any> { return this.http.put(`${this.serverName}/api/wholesalers/order/${id}/received?wholesalerId=${wholesalerId}`, null, { headers: this.h() }); }
  cancelWholesalerOrder(id: any): Observable<any>        { return this.http.put(`${this.serverName}/api/wholesalers/order/${id}/cancel`, null, { headers: this.h() }); }
  getInventoryByWholesalers(wId: any): Observable<any>   { return this.http.get(`${this.serverName}/api/wholesalers/inventories?wholesalerId=${wId}`, { headers: this.h() }); }
  addInventory(d: any, pId: any): Observable<any>        { return this.http.post(`${this.serverName}/api/wholesalers/inventories?productId=${pId}`, d, { headers: this.h() }); }
  updateInventory(qty: any, iId: any): Observable<any>   { return this.http.put(`${this.serverName}/api/wholesalers/inventories/${iId}?stockQuantity=${qty}`, null, { headers: this.h() }); }
  getWholesalerFeedbacks(userId: any): Observable<any>   { return this.http.get(`${this.serverName}/api/wholesalers/feedbacks?userId=${userId}`, { headers: this.h() }); }

  // ── CONSUMER ─────────────────────────────────────────────────
  getProductsByConsumers(): Observable<any>                    { return this.http.get(`${this.serverName}/api/consumers/products`, { headers: this.h() }); }
  getWholesalersForProduct(pId: any): Observable<any>          { return this.http.get(`${this.serverName}/api/consumers/products/${pId}/wholesalers`, { headers: this.h() }); }
  getOrderConsumer(userId: any): Observable<any>               { return this.http.get(`${this.serverName}/api/consumers/orders?userId=${userId}`, { headers: this.h() }); }
  consumerPlaceOrder(d: any, pId: any, uId: any): Observable<any> { return this.http.post(`${this.serverName}/api/consumers/order?productId=${pId}&userId=${uId}`, d, { headers: this.h() }); }
  cancelConsumerOrder(id: any): Observable<any>                { return this.http.put(`${this.serverName}/api/consumers/order/${id}/cancel`, null, { headers: this.h() }); }
  addConsumerFeedBack(id: any, uId: any, d: any): Observable<any> { return this.http.post(`${this.serverName}/api/consumers/order/${id}/feedback?userId=${uId}`, d, { headers: this.h() }); }

  // Keep for backward compat
  getOrderByWholesalers(userId: any): Observable<any>    { return this.getPlacedOrders(userId); }

  // ── AUTH ─────────────────────────────────────────────────────
  Login(d: any): Observable<any>       { return this.http.post(`${this.serverName}/api/user/login`, d, { headers: new HttpHeaders({'Content-Type':'application/json'}) }); }
  registerUser(d: any): Observable<any>{ return this.http.post(`${this.serverName}/api/user/register`, d, { headers: new HttpHeaders({'Content-Type':'application/json'}) }); }
}