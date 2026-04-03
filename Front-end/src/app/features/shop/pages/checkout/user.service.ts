import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = '/api/users/';

  constructor(private http: HttpClient) { }
  
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(this.apiUrl + userId, { withCredentials: true });
  }

  getCartByUserId(userId: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + userId + '/cart', { withCredentials: true });
  }

  addProductToOrder(userId: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + userId + '/order', {}, { withCredentials: true });
  }

  addProductToCart(userId: string, productId: string, quantity: number): Observable<any> {
    const body = {
      user_id: userId,
      product: productId,
      quantity: quantity
    };
    return this.http.post<any>(`${this.apiUrl}${userId}/cart`, body, { withCredentials: true });
  }
}
