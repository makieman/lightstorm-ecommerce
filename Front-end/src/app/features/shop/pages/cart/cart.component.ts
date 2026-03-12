import { CoreProductService } from '@app/core/services/core-product.service';
import { CartService } from '@app/core/services/cart.service';
import { CartProductsCountService } from '@app/core/services/cart-products-count.service';
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClientModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartItem, cartState } from '@app/core/models/cart.models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  userid = "";
  cart: CartItem[] = [];
  total: number = 0;
  showAddressForm: boolean = false;
  showCouponForm: boolean = false;
  selectedCountry: string = 'Kenya';
  countries: string[] = ["Kenya", "Algeria", "Bahrain", "Djibouti", "Egypt", "Iraq", "Jordan", "Kuwait", "Lebanon", "Libya", "Mauritania", "Morocco", "Oman", "Palestine", "Qatar", "Saudi Arabia", "Somalia", "Sudan", "Syria", "Tunisia"];

  deletedProduct: { _id: string, title: string, image: string, quantity: number, price: number } | null = null;

  constructor(
    private userService: CartService,
    private productsService: CoreProductService,
    private cartCountService: CartProductsCountService,
    private http: HttpClient,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  updateTotal() {
    this.total = 0;
    this.cart.forEach(item => {
      this.total += item.product.price * item.quantity;
    });
  }
  get cartState(): cartState {
    const items = this.cart;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return { items, total: totalItems, totalprice: totalPrice };
  }

  toggleAddressForm() {
    this.showAddressForm = !this.showAddressForm;
  }
  toggleCouponForm() {
    this.showCouponForm = !this.showCouponForm;
  }

  get shippingFee(): number {
    return this.cart.length === 0 ? 0 : 200;
  }

  get grandTotal(): number {
    return this.cartState.totalprice + this.shippingFee;
  }


  onUpdateCountry() {
    localStorage.setItem('selectedCountry', this.selectedCountry);
  }



  increaseProductQuantity(productid: string) {
    if (this.userid) {
      this.userService.increaseProductQuantity(this.userid, productid).subscribe({
        next: (data: any) => {
          const productIndex = this.cart.findIndex(item => item.product._id === productid);
          if (productIndex !== -1) {
            this.cart[productIndex].quantity++;
            this.updateTotal();
          }
        },
        error: (error: any) => {
          console.error("Failed to increase product quantity", error);
        }
      });
    } else {
      this.userService.updateGuestQuantity(productid, 'increase');
      const productIndex = this.cart.findIndex(item => item.product._id === productid);
      if (productIndex !== -1) {
        this.cart[productIndex].quantity++;
        this.updateTotal();
      }
    }
  }

  decreaseProductQuantity(productid: string) {
    if (this.userid) {
      this.userService.decreaseProductQuantity(this.userid, productid).subscribe({
        next: (data: any) => {
          const productIndex = this.cart.findIndex(item => item.product._id === productid);
          if (productIndex !== -1) {
            if (this.cart[productIndex].quantity > 1) {
              this.cart[productIndex].quantity--;
            } else {
              this.deleteProduct(productid);
              return;
            }
            this.updateTotal();

          }
        },
        error: (error: any) => {
          console.error("Failed to decrease product quantity", error);
        }
      });
    } else {
      this.userService.updateGuestQuantity(productid, 'decrease');
      const productIndex = this.cart.findIndex(item => item.product._id === productid);
      if (productIndex !== -1) {
        if (this.cart[productIndex].quantity > 1) {
          this.cart[productIndex].quantity--;
        } else {
          this.cart.splice(productIndex, 1);
        }
        this.updateTotal();
      }
    }
  }

  deleteProduct(productid: string) {
    if (this.userid) {
      this.userService.removeProductFromCart(this.userid, productid).subscribe({
        next: (data: any) => {
          const index = this.cart.findIndex(item => item.product._id === productid);
          if (index !== -1) {
            this.deletedProduct = this.cart[index].product;
            this.cart.splice(index, 1);
            this.updateTotal();
          }
        },
        error: (error: any) => {
          console.error("Failed to delete product", error);
        }
      });
    } else {
      this.userService.removeFromGuestCart(productid);
      const index = this.cart.findIndex(item => item.product._id === productid);
      if (index !== -1) {
        this.deletedProduct = this.cart[index].product;
        this.cart.splice(index, 1);
        this.updateTotal();
      }
    }
  }

  getAuthUser(): Observable<string> {
    return this.http.get<any>("/api/users/user/user", { withCredentials: true })
      .pipe(
        map(response => response.data._id)
      );
  }

  goToCheckout() {
    if (this.cart.length === 0) return;
    if (this.userid) {
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: '/checkout' } });
    }
  }

  ngOnInit() {
    this.getAuthUser().subscribe({
      next: (userid) => {
        this.zone.run(() => {
          this.userid = userid;
          this.loadBackendCart();
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.userid = "";
          this.loadGuestCart();
          this.cdr.markForCheck();
        });
      }
    });
  }

  loadBackendCart(): void {
    this.cart = [];
    this.selectedCountry = localStorage.getItem('selectedCountry') || 'Kenya';

    this.userService.getUserById(this.userid).subscribe({
      next: (data: any) => {
        const cartItems: { product: string; quantity: number }[] = data.carts || [];

        if (cartItems.length === 0) {
          this.zone.run(() => {
            this.cart = [];
            this.updateTotal();
            this.cartCountService.updateData(0);
            this.cdr.detectChanges();
          });
          return;
        }

        const productRequests: Observable<any>[] = cartItems.map(item =>
          this.productsService.getProductById(item.product).pipe(
            map(productData => ({ product: productData, quantity: item.quantity })),
            catchError(() => {
              // Product deleted - remove from backend cart silently
              this.userService.removeProductFromCart(this.userid, item.product).subscribe();
              return of(null);
            })
          )
        );

        forkJoin(productRequests).subscribe({
          next: (results: any[]) => {
            this.zone.run(() => {
              this.cart = results.filter(r => r !== null);
              this.updateTotal();
              const totalQty = this.cart.reduce((sum, i) => sum + i.quantity, 0);
              this.cartCountService.updateData(totalQty);
              this.cdr.detectChanges();
            });
          },
          error: () => {
            this.zone.run(() => {
              this.cart = [];
              this.cdr.detectChanges();
            });
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.cart = [];
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadGuestCart(): void {
    this.cart = [];
    this.selectedCountry = localStorage.getItem('selectedCountry') || 'Kenya';

    const guestItems = this.userService.getGuestCart();

    if (guestItems.length === 0) {
      this.zone.run(() => {
        this.cart = [];
        this.updateTotal();
        this.cdr.detectChanges();
      });
      return;
    }

    const productRequests: Observable<any>[] = guestItems.map(item =>
      this.productsService.getProductById(item.product).pipe(
        map(productData => ({ product: productData, quantity: item.quantity })),
        catchError(() => of(null))
      )
    );

    forkJoin(productRequests).subscribe({
      next: (results: any[]) => {
        this.zone.run(() => {
          this.cart = results.filter(r => r !== null);
          this.updateTotal();
          const totalQty = this.cart.reduce((sum, i) => sum + i.quantity, 0);
          this.cartCountService.updateData(totalQty);
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.cart = [];
          this.cdr.detectChanges();
        });
      }
    });
  }
}
