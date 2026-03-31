import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public serverName = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Wholesaler
  getProductsByWholesaler(): Observable<any> {
    return this.http.get(`${this.serverName}/api/wholesalers/products`,
      { headers: this.getAuthHeaders() });
  }

  getOrderByWholesalers(userId: any): Observable<any> {
    return this.http.get(`${this.serverName}/api/wholesalers/orders?userId=${userId}`,
      { headers: this.getAuthHeaders() });
  }

  getInventoryByWholesalers(wholesalerId: any): Observable<any> {
    return this.http.get(`${this.serverName}/api/wholesalers/inventories?wholesalerId=${wholesalerId}`,
      { headers: this.getAuthHeaders() });
  }

  placeOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/wholesalers/order?productId=${productId}&userId=${userId}`,
      details, { headers: this.getAuthHeaders() });
  }

  updateOrderStatus(id: any, status: any): Observable<any> {
    return this.http.put(`${this.serverName}/api/wholesalers/order/${id}?status=${status}`,
      null, { headers: this.getAuthHeaders() });
  }

  addInventory(details: any, productId: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/wholesalers/inventories?productId=${productId}`,
      details, { headers: this.getAuthHeaders() });
  }

  updateInventory(stockQuantity: any, inventoryId: any): Observable<any> {
    return this.http.put(`${this.serverName}/api/wholesalers/inventories/${inventoryId}?stockQuantity=${stockQuantity}`,
      null, { headers: this.getAuthHeaders() });
  }

  // Consumer
  getProductsByConsumers(): Observable<any> {
    return this.http.get(`${this.serverName}/api/consumers/products`,
      { headers: this.getAuthHeaders() });
  }

  getOrderConsumer(userId: any): Observable<any> {
    return this.http.get(`${this.serverName}/api/consumers/orders?userId=${userId}`,
      { headers: this.getAuthHeaders() });
  }

  consumerPlaceOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/consumers/order?productId=${productId}&userId=${userId}`,
      details, { headers: this.getAuthHeaders() });
  }

  addConsumerFeedBack(id: any, userId: any, details: any): Observable<any> {
    // console.log(id+" from httpService");
    
    return this.http.post(`${this.serverName}/api/consumers/order/${id}/feedback?userId=${userId}`,
      details, { headers: this.getAuthHeaders() });
  }

  // Manufacturer
  getProductsByManufacturer(manufacturerId: any): Observable<any> {
    return this.http.get(`${this.serverName}/api/manufacturers/products?manufacturerId=${manufacturerId}`,
      { headers: this.getAuthHeaders() });
  }

  createProduct(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/manufacturers/product`,
      details, { headers: this.getAuthHeaders() });
  }

  updateProduct(details: any, productId: any): Observable<any> {
    return this.http.put(`${this.serverName}/api/manufacturers/product/${productId}`,
      details, { headers: this.getAuthHeaders() });
  }

  // Auth
  Login(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/user/login`, details,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
  }

  registerUser(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/user/register`, details,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
  }
}