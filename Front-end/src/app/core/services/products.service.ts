import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = '/api';

  constructor(public http: HttpClient) { }

  getProducts() {
    return this.http.get(`${this.apiUrl}/products`);
  }
  getProductById(id: any) {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }
  createProduct(product: any) {
    return this.http.post(`${this.apiUrl}/products`, product);
  }
  updateProduct(id: string, product: any) {
    return this.http.put(`${this.apiUrl}/products/${id}`, product);
  }
  deleteProduct(id: string) {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

}
