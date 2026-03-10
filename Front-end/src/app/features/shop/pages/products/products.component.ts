import { Component, OnInit, ViewEncapsulation, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';

import { CoreProductService } from '@app/core/services/core-product.service';

import { UserService } from '../checkout/user.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  encapsulation: ViewEncapsulation.None
})

export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'All Categories';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  searchTerm: string = '';
  sortOption: string = '-createdAt';
  currentPage: number = 1;
  pageSize: number = 24;
  totalItems: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;
  isLargeView: boolean = false;
  isFilterDrawerOpen: boolean = false;
  viewMode: 'grid' | 'large' = 'grid';

  readonly skeletonCards = Array.from({ length: 6 });
  readonly categories = [
    { label: 'Solar Panels', value: 'Solar Panel' },
    { label: 'Inverters', value: 'Inverter' },
    { label: 'Batteries', value: 'Battery' },
    { label: 'Charge Controllers', value: 'Charge Controller' },
    { label: 'Solar Lighting', value: 'Solar Lighting' },
    { label: 'Mounting Systems', value: 'Mounting Systems' }
  ];

  constructor(
    private userService: UserService,
    private productService: CoreProductService,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      distinctUntilChanged((prev, curr) =>
        prev['category'] === curr['category'] &&
        prev['search'] === curr['search'] &&
        prev['minPrice'] === curr['minPrice'] &&
        prev['maxPrice'] === curr['maxPrice'] &&
        prev['page'] === curr['page'] &&
        prev['sort'] === curr['sort']
      )
    ).subscribe(params => {
      this.selectedCategory = params['category'] || 'All Categories';
      this.searchTerm = params['search'] || '';
      this.minPrice = params['minPrice'] ? Number(params['minPrice']) : undefined;
      this.maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : undefined;
      this.currentPage = params['page'] ? Number(params['page']) : 1;
      this.sortOption = params['sort'] || '-createdAt';
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      sort: this.sortOption,
      search: this.searchTerm,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      category: this.selectedCategory !== 'All Categories' 
        ? this.selectedCategory 
        : undefined
    };

    this.productService.getAllProducts(params).subscribe({
      next: (response: any) => {
        this.zone.run(() => {
          this.filteredProducts = response.products || [];
          this.products = this.filteredProducts;
          if (response.pagination) {
            this.currentPage = response.pagination.page;
            this.totalItems = response.pagination.totalItems;
            this.totalPages = response.pagination.totalPages;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (error: any) => {
        this.zone.run(() => {
          console.error('Error loading products:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateUrlWithFilters();
    this.closeFilterDrawer();
  }

  clearAllFilters(): void {
    this.selectedCategory = 'All Categories';
    this.searchTerm = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.sortOption = '-createdAt';
    this.currentPage = 1;
    this.updateUrlWithFilters();
    this.closeFilterDrawer();
  }

  toggleFilterDrawer(): void {
    this.isFilterDrawerOpen = !this.isFilterDrawerOpen;
  }

  closeFilterDrawer(): void {
    this.isFilterDrawerOpen = false;
  }

  setViewMode(mode: 'grid' | 'large'): void {
    this.viewMode = mode;
    this.isLargeView = mode === 'large';
  }

  goToPreviousPage(): void {
    if (this.currentPage <= 1) {
      return;
    }

    this.currentPage -= 1;
    this.updateUrlWithFilters();
  }

  goToNextPage(): void {
    if (this.currentPage >= this.totalPages) {
      return;
    }

    this.currentPage += 1;
    this.updateUrlWithFilters();
  }

  navigateToProductDetails(productId: string): void {
    this.router.navigate(['product', productId]);
  }

  private updateUrlWithFilters(): void {
    const queryParams: any = {
      page: this.currentPage > 1 ? this.currentPage : null,
      sort: this.sortOption !== '-createdAt' ? this.sortOption : null,
      search: this.searchTerm || null,
      category: this.selectedCategory !== 'All Categories' ? this.selectedCategory : null,
      minPrice: this.minPrice || null,
      maxPrice: this.maxPrice || null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/placeholder-product.png';
    }
  }

  addToCart(product: any): void {
    this.productService.getUserToken().subscribe(
      (response: any) => {
        const userId = response.data._id;
        const quantity = 1;
        this.userService.addProductToCart(userId, product._id, quantity).subscribe(
          (addResponse: any) => {
            console.log('Item added to cart successfully:', addResponse);
          },
          (error: any) => {
            if (error.error && error.error.message) {
              console.error('Error adding item to cart:', error.error.message);
            } else {
              console.error('Error adding item to cart:', error);
            }
          }
        );
      },
      (error: any) => {
        if (error.error && error.error.message) {
          console.error('Error getting user details:', error.error.message);
        } else {
          console.error('Error getting user details:', error);
        }
      }
    );
  }

  trackByProduct(_index: number, product: any): string {
    return product._id;
  }
}
