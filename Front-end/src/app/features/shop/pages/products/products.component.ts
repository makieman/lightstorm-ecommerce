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
  isLargeView: boolean = false;
  categoryMap: Record<string, string> = {
    'Chair': 'Solar Panels',
    'Table': 'Inverters',
    'Coach': 'Batteries',
    'Sofa': 'Charge Controllers',
    'Lamp': 'Solar Lighting',
    'Bed': 'Mounting Systems'
  };

  constructor(
    private userService: UserService,
    private productService: CoreProductService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || 'All Categories';
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      (response: any) => {
        this.products = response.filter((product: any) => product.quantity > 0);
        this.filterProducts();
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  // Centralized Filter Logic
  filterProducts(): void {
    this.filteredProducts = this.products.filter((product) => {
      // 1. Category Check
      const matchesCategory = this.selectedCategory === 'All Categories' ||
        product.category.toLowerCase() === this.selectedCategory.toLowerCase();

      // 2. Price Check
      const matchesPrice = (this.minPrice === undefined || product.price >= this.minPrice) &&
        (this.maxPrice === undefined || product.price <= this.maxPrice);

      // 3. Name/Search Check
      const matchesSearch = this.searchTerm === '' ||
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesCategory && matchesPrice && matchesSearch;
    });
  }

  //Apply The Filter by Category 
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

  //Apply Name Filter
  applyNameFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterProducts();
  }

  navigateToProductDetails(productId: string): void {
    this.router.navigate(['product', productId]);
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
