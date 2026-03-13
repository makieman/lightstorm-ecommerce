import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { CoreProductService } from '@app/core/services/core-product.service';
import { CartService } from '@app/core/services/cart.service';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OneProductComponent } from './one-product/one-product.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CartProductsCountService } from '../../../../core/services/cart-products-count.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface Review {
  user_id: string;
  name: string;
  comment: string;
  rating: number;
}

export interface Product {
  _id: string;
  category: string;
  quantity: number;
  reviews: Review[];
  [key: string]: any;
}


@Component({
  selector: 'app-single-product-details',
  standalone: true,
  imports: [
    MatButtonToggleModule,
    FormsModule,
    FieldsetModule,

    CommonModule,
    MatIconModule,
    RouterModule,
    OneProductComponent,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './single-product-details.component.html',
  styleUrl: './single-product-details.component.css'
})
export class SingleProductDetailsComponent implements OnInit {
  ID: any;
  product: Product | any;
  quantity: number = 1;
  selectedTab: 'description' | 'reviews' = 'description';
  review: string = '';
  name: any;
  rating: any;
  email: any;
  relatedProducts: any[] = [];
  allProducts: any[] = [];
  currentProductIndex: number = 0;
  isFirstProduct: boolean = false;
  isLastProduct: boolean = false;
  user_id: string | any;
  product_number: number = 0;
  reviewForm: FormGroup;
  submitted: boolean = false;
  ratingSelected: boolean = false;
  currentImageIndex: number = 0; // NEW: for image gallery

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: CoreProductService,
    private formBuilder: FormBuilder,
    private productsCount: CartProductsCountService,
    private cartService: CartService,
    private dialog: MatDialog
  ) {
    this.ID = route.snapshot.params["id"];
    console.debug('[SingleProduct] initialized, route id =', this.ID);
  }

  /************** Open dialog for image full screen ***************/
  openImageDialog(imageSrc: string): void {
    this.dialog.open(ImageDialogComponent, {
      data: { imageSrc: imageSrc },
      panelClass: 'full-screen-dialog'
    });
  }

  /**
   * Get array of product images with backward compatibility
   * If images exist, return them; otherwise convert single image to array
   */
  get productImages(): string[] {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images;
    }
    return this.product?.image ? [this.product.image] : [];
  }

  /**
   * Get current image URL
   */
  get currentImage(): string {
    const images = this.productImages;
    if (!images.length) return '';
    return images[this.currentImageIndex];
  }

  /**
   * Navigate to next image
   */
  nextImage(): void {
    const len = this.productImages.length;
    if (len <= 1) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % len;
  }

  /**
   * Navigate to previous image
   */
  prevImage(): void {
    const len = this.productImages.length;
    if (len <= 1) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + len) % len;
  }

  /**
   * Set image by index (from thumbnail click)
   */
  setImage(index: number): void {
    this.currentImageIndex = index;
  }


  ngOnInit(): void {

    /******* get single product ********/
    this.productService.getProductById(this.ID).subscribe({
      next: (data: any) => {
        if (data == null) {
          this.router.navigate(['/']);
        }
        this.product = data;
        console.debug('[SingleProduct] product loaded:', this.ID, this.product);
        this.syncRelatedProducts();

      },
      error: (err: any) => {
        console.error('[SingleProduct] cannot get the product !!', err);
      }
    })

    /********** get related products **********/
    this.productService.getAllProducts().subscribe({
      next: (data: any[]) => {
        this.allProducts = data;
        this.syncRelatedProducts();
      },
      error: (err: any) => {
        console.log('cannot get related products !!', err);
      }
    });



    /********** get user token ***********/

    this.productService.getUserToken().subscribe({
      next: (data: any) => {
        this.product_number = data.data.carts.length;
        this.user_id = data.data._id;
      },
      error: (err: any) => {
        console.log('cannot get user token !!', err);
      }
    });

    /********** validate reviews form ************/
    this.reviewForm = this.formBuilder.group({
      rating: [null],
      comment: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
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

  /********************** Desc and Reviews btns **********************/

  showDescription() {
    this.selectedTab = 'description';
  }

  showReviews() {
    this.selectedTab = 'reviews';
  }


  toggleStar(index: number) {

    this.newReview.rating = index;

    let allReviews = this.product.reviews;
    for (let i = 0; i < allReviews.length; i++) {
      if (allReviews[i].user_id === this.user_id) {
        allReviews[i].rating = index;
        return;
      }
    }
  }


  resetStarStates() {
    for (let i = 1; i <= 5; i++) {
      this.isStarFilled(i);
    }
  }

  isStarFilled(index: number): boolean {
    return this.newReview.rating >= index;
  }

  newReview = {
    name: '',
    comment: '',
    rating: 0
  };

  /***************************** Validate add review form **************************/

  get f() {
    return this.reviewForm.controls;
  }

  /************************* Add review to database *****************/
  addReview() {

    this.submitted = true;
    if (!this.reviewForm.invalid) {

      const newReview = {
        user_id: this.user_id,
        name: this.reviewForm.value.name,
        comment: this.reviewForm.value.comment,
        rating: this.newReview.rating
      };

      this.productService.addReview(this.ID, newReview).subscribe({
        next: (data: any) => {
          if (!this.product.reviews) {
            this.product.reviews = [];
          }
          const existingReviewIndex = this.product.reviews.findIndex((review: { user_id: string; }) => review.user_id === this.user_id);
          if (existingReviewIndex !== -1) {
            this.product.reviews[existingReviewIndex] = data.review;
            Swal.fire({
              icon: 'success',
              title: 'Your review added successfully',
            })
          } else {
            this.product.reviews.push(data.review);
            Swal.fire({
              icon: 'success',
              title: 'Your review added successfully',
            });
          }

          this.reviewForm.reset();
          this.submitted = false;
          this.newReview.rating = 0;
          this.resetStarStates();
        },
        error: (err: any) => {
          console.log('cannot add review !!', err);
        }
      });
    }
  }


  getStarIcons(rating: number): string[] {
    const starIcons: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starIcons.push('star-filled-review');
      } else {
        starIcons.push('star-empty');
      }
    }
    return starIcons;
  }

  navigateToRelatedProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  syncRelatedProducts() {
    if (!this.product || !this.allProducts.length) {
      return;
    }

    // Get category identifier (handle both string and object cases)
    const productCategoryId = typeof this.product.category === 'object' 
      ? this.product.category?._id || this.product.category?.id 
      : this.product.category;

    // Filter by matching category (with flexible comparison)
    const relatedProducts = this.allProducts.filter((product: any) => {
      if (product._id === this.product._id) return false; // Skip current product
      
      const otherCategoryId = typeof product.category === 'object'
        ? product.category?._id || product.category?.id
        : product.category;
      
      return otherCategoryId && productCategoryId && 
             otherCategoryId.toString() === productCategoryId.toString();
    });

    // Fallback: if no category matches, show latest products
    const fallbackProducts = this.allProducts
      .filter((product: any) => product._id !== this.product._id)
      .slice(0, 4);

    // Use category matches if available, otherwise use fallback (latest 4 products)
    this.relatedProducts = (relatedProducts.length > 0 ? relatedProducts : fallbackProducts)
      .filter(Boolean)
      .slice(0, 4); // Limit to 4 related products

    const matchedIndex = this.allProducts.findIndex((product: any) => product._id === this.product._id);
    this.currentProductIndex = matchedIndex >= 0 ? matchedIndex : 0;
    this.checkFirstAndLastProducts();
    this.updateCurrentProductIndexInStorage();
  }


  /****************** paginate to next and prev product ****************/

  navigateToPreviousProduct() {
    if (this.currentProductIndex > 0) {
      this.currentProductIndex--;
      this.updateCurrentProductIndexInStorage();
      window.location.href = '/product/' + this.allProducts[this.currentProductIndex]._id;

    }
    this.checkFirstAndLastProducts();
  }

  navigateToNextProduct() {
    if (this.currentProductIndex < this.allProducts.length - 1) {
      this.currentProductIndex++;
      this.updateCurrentProductIndexInStorage();
      window.location.href = '/product/' + this.allProducts[this.currentProductIndex]._id;
    }
    this.checkFirstAndLastProducts();
  }

  checkFirstAndLastProducts() {
    this.isFirstProduct = this.currentProductIndex === 0;
    this.isLastProduct = this.currentProductIndex === this.allProducts.length - 1;
  }

  updateCurrentProductIndexInStorage() {
    localStorage.setItem('currentProductIndex', String(this.currentProductIndex));
  }

  /*********************** Product img movement *************************/
  moveImage(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    const container = img.parentElement;
    if (container) {
      const containerRect = container.getBoundingClientRect();

      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const containerAspectRatio = containerWidth / containerHeight;

      const imgAspectRatio = img.width / img.height;

      let maxWidth = containerWidth;
      let maxHeight = containerHeight;
      if (imgAspectRatio > containerAspectRatio) {
        maxHeight = containerWidth / imgAspectRatio;
      } else {
        maxWidth = containerHeight * imgAspectRatio;
      }

      img.style.width = `100%`;
      img.style.height = `${maxHeight}px`;
    }
  }

  /*********************** Add product to cart *************************/

  addProductToCart() {
    if (this.product.quantity >= this.quantity) {
      if (this.user_id) {
        // Authenticated user
        this.productService.addProductToCart(this.user_id, this.ID, this.quantity)
          .subscribe({
            next: (data: any) => {
              Swal.fire({
                icon: 'success',
                title: 'Added to cart!',
                text: `${this.product.title} has been added to your cart.`,
                timer: 2000,
                showConfirmButton: false
              });
              // removed - provideZoneChangeDetection handles re-rendering now
            },
            error: (err: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Cannot add product to cart, please try again later.',
              });
            }
          });
      } else {
        // Guest user
        this.cartService.addToGuestCart(this.ID, this.quantity);
        Swal.fire({
          icon: 'success',
          title: 'Added to cart!',
          text: `${this.product.title} added to your guest cart.`,
          timer: 2000,
          showConfirmButton: false
        });
        // removed - provideZoneChangeDetection handles re-rendering now
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Not enough quantity in stock!',
      });
    }
  }

  /********************************************************************/


  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/placeholder-product.png';
    }
  }
}


@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './ImageDialog/image-dialog.component.html',
  styleUrls: ['./ImageDialog/image-dialog.component.css']
})
export class ImageDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImageDialogComponent>
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
