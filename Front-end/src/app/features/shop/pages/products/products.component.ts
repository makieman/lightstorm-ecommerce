import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreProductService } from '@app/core/services/core-product.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../checkout/user.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
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

  // --- Server-side Filtering & Pagination State ---
  sortOption: string = '-createdAt'; // Default sort
  currentPage: number = 1;
  pageSize: number = 24; // Items per page
  totalItems: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  isLargeView: boolean = false;

  constructor(
    private userService: UserService,
    private productService: CoreProductService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Read filter, sort, and page state from URL on load
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
      category: this.selectedCategory !== 'All Categories' ? this.selectedCategory : undefined
    };

    this.productService.getAllProducts(params).subscribe(
      (response: any) => {
        this.filteredProducts = response.products || [];
        this.products = this.filteredProducts; // Keep in sync for template compatibility

        if (response.pagination) {
          this.currentPage = response.pagination.page;
          this.totalItems = response.pagination.totalItems;
          this.totalPages = response.pagination.totalPages;
        }

        this.isLoading = false;
        this.updateUrlWithFilters();
      },
      (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    );
  }

  // This method now triggers a new API call with the current filters
  filterProducts(): void {
    this.currentPage = 1; // Reset to the first page when filters change
    this.loadProducts();
  }

  // Apply The Filter by Category 
  applyCategoryFilter(): void {
    this.filterProducts();
  }

  // Apply price filter
  applyPriceFilter(): void {
    this.filterProducts();
  }

  // Reset price filter
  resetPriceFilter(): void {
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.filterProducts();
  }

  // Apply Name Filter
  applyNameFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterProducts();
  }

  navigateToProductDetails(productId: string): void {
    this.router.navigate(['product', productId]);
  }

  // Updates the browser URL to reflect the current filter state, making links shareable
  private updateUrlWithFilters(): void {
    const queryParams: any = {
      // Only add params to the URL if they are not the default value
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
      queryParamsHandling: 'merge', // Keep other existing query params
      replaceUrl: true // Avoid adding to browser history for every filter change
    });
  }

  addToCart(product: any): void {
    this.productService.getUserToken().subscribe(
      (response: any) => {
        const userId = response.data._id;
        const quantity = 1;
        this.userService.addProductToCart(userId, product._id, quantity).subscribe(
          (response: any) => {
            console.log('Item added to cart successfully:', response);
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

  ngAfterViewInit(): void {

    // Set default view mode to grid
    const setDefaultGridView = () => {
      document.querySelector('.grid')?.classList.add('active');
      document.querySelector('.large')?.classList.remove('active');
      document.querySelectorAll('.products-area-wrapper').forEach((view) => {
        view.classList.remove('tableView', 'largeView');
        view.classList.add('gridView');
      });
      this.isLargeView = false;
    };

    // Event listener for grid view
    document.querySelector('.grid')?.addEventListener('click', () => {
      setDefaultGridView();
    });

    // Event listener for large view
    document.querySelector('.large')?.addEventListener('click', () => {
      document.querySelector('.grid')?.classList.remove('active');
      document.querySelector('.large')?.classList.add('active');
      document.querySelectorAll('.products-area-wrapper').forEach((view) => {
        view.classList.remove('tableView', 'gridView');
        view.classList.add('largeView');
      });
      this.isLargeView = true;
    });

    // Set default view mode to grid
    setDefaultGridView();

    // Event listener for filter menu
    document.querySelector('.jsFilter')?.addEventListener('click', () => {
      document.querySelector('.filter-menu')?.classList.toggle('active');
    });

    // Event listener for toggle sidebar visibility
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    toggleButton?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      toggleButton?.classList.toggle('active');
    });
  }
}
