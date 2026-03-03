import { CoreProductService } from '@app/core/services/core-product.service';
import { CartService } from '@app/core/services/cart.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { CartItem, cartState } from '@app/core/models/cart.models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    HttpClientModule,
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

  constructor(private userService: CartService, private productsService: CoreProductService, private http: HttpClient, private router: Router) { }

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


  onUpdateCountry() {
    const selectedElement = document.getElementById('country') as HTMLSelectElement;
    this.selectedCountry = selectedElement.value;
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
        this.userid = userid;
        this.loadBackendCart();
      },
      error: () => {
        this.userid = "";
        this.loadGuestCart();
      }
    });
  }

  loadBackendCart() {
    this.cart = [];
    this.selectedCountry = localStorage.getItem('selectedCountry') || 'Kenya';
    this.userService.getUserById(this.userid).subscribe({
      next: (data: any) => {
        data.carts.forEach((item: { product: string; quantity: number }) => {
          this.productsService.getProductById(item.product).subscribe({
            next: (productData: any) => {
              this.cart.push({ product: productData, quantity: item.quantity });
              this.updateTotal();
            }
          });
        });
      }
    });
  }

  loadGuestCart() {
    this.cart = [];
    this.selectedCountry = localStorage.getItem('selectedCountry') || 'Kenya';
    const guestItems = this.userService.getGuestCart();
    guestItems.forEach(item => {
      this.productsService.getProductById(item.product).subscribe({
        next: (productData: any) => {
          this.cart.push({ product: productData, quantity: item.quantity });
          this.updateTotal();
        }
      });
    });
  }
}
