import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SingleProductService {

  constructor(private http:HttpClient) { }

  DB_Config = "/api/products/";
  DB_Config_order = "/api/orders";
  

  getProductById(id:number): Observable<any>
  {
      return this.http.get(this.DB_Config+id);
  }

  getAllProducts(): Observable<any[]>{
    return this.http.get<any[]>(this.DB_Config);
  }

  addReview(id:number,review:any): Observable<any>
  {
    return this.http.post(this.DB_Config+id+"/reviews",review);
  }

  getUserToken(): Observable<any>
  {
    return this.http.get(this.DB_Config+"user/product/token", { withCredentials: true });
  }

  addProductToCart(user_id: number, product: number, quantity: number): Observable<any>
  {
    return this.http.post(`${this.DB_Config}product/addtocart`, { user_id, product, quantity })
  }

  getOrderById(id:any): Observable<any>{
    return this.http.get(this.DB_Config_order+"/"+id);
  }

}
