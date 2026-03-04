import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { CoreProductService } from '@app/core/services/core-product.service';
import { CartService } from '@app/core/services/cart.service';
import { CartProductsCountService } from '@app/core/services/cart-products-count.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})

export class ProductComponent implements OnInit {
  user_id: string | null = null;

  constructor(
    private productService: CoreProductService,
    private cartService: CartService,
    private cartCountService: CartProductsCountService,
    public dialog: MatDialog
  ) { }
  allProducts: any[] = [];
  categories: string[] = [];
  productsByCategory: { [key: string]: any[] } = {};

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (data: any) => {
        this.allProducts = data.products || data;
        this.groupProductsByCategory();
      }
    });

    this.productService.getUserToken().subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.user_id = data.data._id;
        }
      },
      error: (err: any) => {
        console.log('Guest user detected');
      }
    });
  }

  groupProductsByCategory() {
    this.allProducts.forEach(product => {
      if (!this.productsByCategory[product.category]) {
        this.productsByCategory[product.category] = [];
        this.categories.push(product.category);
      }
      if (this.productsByCategory[product.category].length < 8) {
        this.productsByCategory[product.category].push(product);
      }
    });
  }
  openDialog(productId: string) {
    this.productService.getProductById(productId).subscribe((product: any) => {
      const dialogRef = this.dialog.open(DialogContentExampleDialog, {
        data: { product }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    });
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation(); // Prevent navigation to details if parent has routerLink

    const quantity = 1;

    if (this.user_id) {
      // Logged in user
      this.productService.addProductToCart(this.user_id, product._id, quantity).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Added to cart!',
            text: `${product.title} has been added.`,
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
          // Update global count by reloading or using a shared state
          // For now, reload is simpler if count is in header
          setTimeout(() => window.location.reload(), 1500);
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Could not add to cart.',
          });
        }
      });
    } else {
      // Guest user
      this.cartService.addToGuestCart(product._id, quantity);
      Swal.fire({
        icon: 'success',
        title: 'Added to cart!',
        text: `${product.title} added to guest cart.`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  }


}



@Component({
  selector: 'app-product-alert',
  templateUrl: '../../../single-product-details/one-product/product-alert.component.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, FormsModule],
  styleUrl: '../../../single-product-details/one-product/product-alert.component.css'
})
export class DialogContentExampleDialog {

  product: any;
  quantity: number = 1;
  user_id: any;
  ID: any;
  products_number: number;
  constructor(
    public dialogRef: MatDialogRef<DialogContentExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: CoreProductService,
    private route: ActivatedRoute,
    private productsCount: CartProductsCountService,
    private userService: CartService
  ) {

    this.product = data.product;
    this.ID = this.product._id;
  }

  ngOnInit() {
    console.log(this.product);

    this.productService.getUserToken().subscribe({
      next: (data: any) => {
        console.log(data);
        this.user_id = data.data._id;
        // console.log(data.data.carts.length);
        this.products_number = data.data.carts.length;
        // console.log(this.user_id);
      },
      error: (err: any) => {
        console.log('cannot get user token !!', err);
      }
    });
  }


  /**************** Quantity input ****************/
  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange() {
    console.log('Quantity changed to: ', this.quantity);
  }


  /**************** Add to cart ****************/
  addProductToCart() {
    if (this.product.quantity >= this.quantity) {
      if (this.user_id) {
        // Logged in user: add to backend
        this.productService.addProductToCart(this.user_id, this.ID, this.quantity)
          .subscribe({
            next: (data: any) => {
              Swal.fire({
                icon: 'success',
                title: 'Added to cart!',
                text: `${this.product.title} has been added.`,
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                window.location.reload();
              });
            },
            error: (err: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Could not add to cart. Please try again.',
              });
            }
          });
      } else {
        // Guest user: add to local storage
        this.userService.addToGuestCart(this.ID, this.quantity);
        Swal.fire({
          icon: 'success',
          title: 'Added to cart!',
          text: `${this.product.title} added to guest cart.`,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Re-update count if needed or just reload
          window.location.reload();
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Not enough stock available!',
      });
    }
  }


}
