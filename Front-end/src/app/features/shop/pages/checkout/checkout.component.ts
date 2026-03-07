import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from './user.model';
import { CommonModule } from '@angular/common';

import { CoreProductService } from '@app/core/services/core-product.service';
import { Product } from '../products//product.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {
  user: User | null = null;
  cart: any;
  products: Product[] = [];
  userForm!: FormGroup;
  formSubmitted = false;
  cartState: { totalprice: number } = { totalprice: 0 };

  constructor(private userService: UserService, private productService: CoreProductService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      paymentMethod: ['cash', Validators.required]
    });
    // Fetch the logged-in user's details
    this.productService.getUserToken().subscribe((response: any) => {
      const userId = response.data._id;

      this.userService.getUserById(userId).subscribe(user => {
        this.user = user;
        this.userForm.patchValue({
          email: user.email
        });
      });

      this.userService.getCartByUserId(userId).subscribe((cart: any) => {
        console.log(cart);
        this.cart = cart;
        this.loadProducts();
      });
    });
  }

  loadProducts() {
    this.products = [];
    let totalPrice = 0;
    if (this.cart?.cart?.length) {
      this.cart.cart.forEach((item: { product: string, quantity: number }) => {
        this.productService.getProductById(item.product).subscribe({
          next: (product: Product) => {
            this.products.push(product);
            totalPrice += product.price * item.quantity;
            this.cartState.totalprice = totalPrice;
          },
          error: (error) => {
            console.log(error);
          }
        });
      });
    }
  }

  get shippingFee(): number {
    return this.cart?.cart?.length ? 200 : 0;
  }

  get grandTotal(): number {
    return (this.cartState.totalprice || 0) + this.shippingFee;
  }



  // Method to get product by ID
  getProductById(productId: string): Product | undefined {
    return this.products.find(product => product._id === productId);
  }

  navigateToPayment() {
    this.formSubmitted = true;
    if (this.userForm.valid) {
      // Save the user info form data and cart to local storage
      localStorage.setItem('userInfo', JSON.stringify(this.userForm.value));
      console.log(this.userForm.value);
      localStorage.setItem('cart', JSON.stringify(this.cart));

      // Navigate to payment page
      this.router.navigate(['/payment']);
    }
  }

  placeOrder() {
    this.formSubmitted = true;
    if (this.userForm.valid) {
      this.productService.getUserToken().subscribe((response: any) => {
        const userId = response.data._id;
        this.userService.addProductToOrder(userId).subscribe(
          (response) => {
            window.location.href = '/confirm';
            this.router.navigate(['/confirm']);
          },
          (error) => {
            console.error('Failed to place order:', error);
          }
        );
      });
    }
  }
}
