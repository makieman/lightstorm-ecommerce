import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { CartProductsCountService } from './cart-products-count.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly GUEST_CART_KEY = 'lightstorm_guest_cart';

  constructor(
    private http: HttpClient,
    private cartCountService: CartProductsCountService
  ) { }

  private readonly URL_DB = '/api/users';

  getUsers() {
    return this.http.get(this.URL_DB);
  }

  getUserById(id: any) {
    return this.http.get(`${this.URL_DB}/${id}`);
  }
  increaseProductQuantity(userid: any, productid: any) {
    return this.http.put(`${this.URL_DB}/cart/increase`, { userid, productid });
  }
  decreaseProductQuantity(userid: any, productid: any) {
    return this.http.put(`${this.URL_DB}/cart/decrease`, { userid, productid });
  }
  removeProductFromCart(userid: string, productid: string) {
    return this.http.delete(`${this.URL_DB}/cart/remove`, { body: { userid, productid } });
  }

  // Guest Cart Methods
  getGuestCart(): any[] {
    const cart = localStorage.getItem(this.GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  addToGuestCart(productId: string, quantity: number) {
    let cart = this.getGuestCart();
    const existingIndex = cart.findIndex(item => item.product === productId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product: productId, quantity });
    }
    localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(cart));
    this.updateCartCount();
  }

  removeFromGuestCart(productId: string) {
    let cart = this.getGuestCart();
    cart = cart.filter(item => item.product !== productId);
    localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(cart));
    this.updateCartCount();
  }

  updateGuestQuantity(productId: string, action: 'increase' | 'decrease') {
    let cart = this.getGuestCart();
    const index = cart.findIndex(item => item.product === productId);
    if (index > -1) {
      if (action === 'increase') {
        cart[index].quantity++;
      } else {
        if (cart[index].quantity > 1) {
          cart[index].quantity--;
        } else {
          cart.splice(index, 1);
        }
      }
      localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(cart));
      this.updateCartCount();
    }
  }

  clearGuestCart() {
    localStorage.removeItem(this.GUEST_CART_KEY);
    this.updateCartCount();
  }

  updateCartCount() {
    const cart = this.getGuestCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountService.updateData(count);
  }

  // Sync Cart Logic
  syncCartWithBackend(userId: string): Observable<any> {
    const guestCart = this.getGuestCart();
    if (guestCart.length === 0) return of(null);

    // Sequence of requests to add each guest item to backend
    const syncRequests = guestCart.map(item =>
      this.http.post(`/api/products/product/addtocart`, {
        user_id: userId,
        product: item.product,
        quantity: item.quantity
      })
    );

    return forkJoin(syncRequests).pipe(
      tap(() => this.clearGuestCart())
    );
  }
}
