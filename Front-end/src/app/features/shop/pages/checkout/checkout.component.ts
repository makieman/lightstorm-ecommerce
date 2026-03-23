import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from './user.model';
import { CommonModule } from '@angular/common';

import { CoreProductService } from '@app/core/services/core-product.service';
import { Product } from '../products//product.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MpesaService } from '@app/core/services/mpesa.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  
  isPaymentLoading = false;
  paymentStep: 'idle' | 'sending' | 'waiting' | 'success' | 'failed' = 'idle';
  paymentMessage = '';
  phoneNumber = '';

  constructor(private userService: UserService, private productService: CoreProductService, private router: Router, private formBuilder: FormBuilder, private mpesaService: MpesaService) { }

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
    return this.cart?.cart?.length ? 1 : 0;
  }

  get grandTotal(): number {
    return (this.cartState.totalprice || 0) + this.shippingFee;
  }



  // Method to get product by ID
  getProductById(productId: string): Product | undefined {
    return this.products.find(product => product._id === productId);
  }



  placeOrder() {
    this.formSubmitted = true;
    if (this.userForm.valid) {
      if (this.userForm.get('paymentMethod')?.value === 'mpesa') {
        this.processMpesaPayment();
      } else {
        this.saveOrder();
      }
    }
  }

  processMpesaPayment() {
    let targetPhone = this.phoneNumber;
    
    // If the M-Pesa specific field is empty, fall back to the main form's phone number
    if (!targetPhone || targetPhone.length < 10) {
      targetPhone = this.userForm.get('phone')?.value;
    }

    if (!targetPhone || targetPhone.length < 10) {
      alert('Please enter a valid M-Pesa phone number (e.g. 0712345678)');
      return;
    }

    this.isPaymentLoading = true;
    this.paymentStep = 'sending';
    this.paymentMessage = 'Sending payment request...';

    const orderId = `ORD-${Date.now()}`;
    const amount = this.grandTotal;

    this.mpesaService.initiateSTKPush(targetPhone, amount, orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentStep = 'waiting';
          this.paymentMessage = 'Check your phone! Enter your M-Pesa PIN to complete payment.';

          // Start polling for result
          this.mpesaService.pollPaymentStatus(response.checkoutRequestId).subscribe({
            next: (statusRes) => {
              if (statusRes.status === 'success') {
                this.paymentStep = 'success';
                this.paymentMessage = `Payment successful! Receipt: ${statusRes.mpesaReceiptNumber}`;
                this.isPaymentLoading = false;
                this.saveOrder();
              } else if (statusRes.status === 'failed' || statusRes.status === 'cancelled') {
                this.paymentStep = 'failed';
                this.paymentMessage = statusRes.resultDesc || 'Payment failed. Please try again.';
                this.isPaymentLoading = false;
              }
            },
            error: () => {
              this.paymentStep = 'failed';
              this.paymentMessage = 'Could not verify payment. Check M-Pesa messages.';
              this.isPaymentLoading = false;
            }
          });
        } else {
          this.paymentStep = 'failed';
          this.paymentMessage = response.message || 'Failed to send payment request.';
          this.isPaymentLoading = false;
        }
      },
      error: () => {
        this.paymentStep = 'failed';
        this.paymentMessage = 'Payment request failed. Please try again.';
        this.isPaymentLoading = false;
      }
    });
  }

  saveOrder() {
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
