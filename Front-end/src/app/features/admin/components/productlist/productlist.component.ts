import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CoreProductService } from '@app/core/services/core-product.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ViewProductDialogComponent } from './view-product-dialog/view-product-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog/edit-product-dialog.component';
import { CreateProductDialogComponent } from './create-product-dialog/create-product-dialog.component';
import Swal from 'sweetalert2';
import { GroupedProducts } from '@app/features/shop/pages/products/product.model';

@Component({
  selector: 'app-productlist',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './productlist.component.html',
  styleUrl: './productlist.component.css',
})
export class ProductlistComponent implements OnInit {
  groupedProducts: GroupedProducts[] = [];
  products: any;
  isLoading = true;
  expandedCategories: Set<string> = new Set();

  // Stock editing state
  editingStock: { [productId: string]: boolean } = {};
  stockValues: { [productId: string]: number } = {};
  savingStock: { [productId: string]: boolean } = {};

  constructor(
    private myproductService: CoreProductService,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadGroupedProducts();
  }

  loadGroupedProducts() {
    this.isLoading = true;
    this.myproductService.getGroupedProducts().subscribe({
      next: (data) => {
        this.groupedProducts = data;
        // Expand all categories by default
        this.groupedProducts.forEach(group => {
          this.expandedCategories.add(group._id || 'uncategorized');
          // Initialize stock values
          group.products.forEach(product => {
            this.stockValues[product._id] = product.quantity;
          });
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading grouped products:', err);
        this.isLoading = false;
        // Fallback to flat list
        this.myproductService.getAllProducts().subscribe((data) => {
          this.products = data;
        });
      }
    });
  }

  toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  getLowStockCount(group: GroupedProducts): number {
    return group.products.filter(p => p.quantity <= (p.lowStockThreshold ?? 5)).length;
  }

  getTotalProducts(): number {
    return this.groupedProducts.reduce((sum, group) => sum + group.products.length, 0);
  }

  // ======================== Stock Management ========================

  startEditStock(productId: string) {
    this.editingStock[productId] = true;
  }

  cancelEditStock(productId: string, originalQuantity: number) {
    this.editingStock[productId] = false;
    this.stockValues[productId] = originalQuantity;
  }

  saveStock(productId: string) {
    const newQuantity = this.stockValues[productId];
    if (newQuantity < 0 || !Number.isInteger(newQuantity)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Quantity',
        text: 'Stock quantity must be a non-negative integer.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    this.savingStock[productId] = true;

    this.myproductService.updateStock(productId, newQuantity).subscribe({
      next: (response) => {
        this.savingStock[productId] = false;
        this.editingStock[productId] = false;

        // Update local data
        for (const group of this.groupedProducts) {
          const product = group.products.find(p => p._id === productId);
          if (product) {
            product.quantity = newQuantity;
            break;
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Stock Updated',
          text: `Quantity set to ${newQuantity}`,
          toast: true,
          position: 'top-end',
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.savingStock[productId] = false;
        // Rollback
        for (const group of this.groupedProducts) {
          const product = group.products.find(p => p._id === productId);
          if (product) {
            this.stockValues[productId] = product.quantity;
            break;
          }
        }
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.error?.message || 'Failed to update stock.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  isLowStock(product: any): boolean {
    const threshold = product.lowStockThreshold ?? 5;
    return product.quantity <= threshold;
  }

  isOutOfStock(product: any): boolean {
    return product.quantity === 0;
  }

  // ======================== Product CRUD ========================

  deleteProduct(id: any) {
    Swal.fire({
      title: 'Delete Product?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.myproductService.deleteProduct(id).subscribe((data) => {
          Swal.fire({
            icon: 'success',
            title: 'Product deleted successfully',
            toast: true,
            position: 'top-end',
            timer: 2500,
            showConfirmButton: false
          });
          this.loadGroupedProducts();
        });
      }
    });
  }

  editProduct(id: any) {
    this.myproductService.getProductById(id).subscribe((data) => {
      const dialog = this.dialog.open(EditProductDialogComponent, {
        width: '500px',
        data: { productFromParent: data },
      });
      dialog.afterClosed().subscribe(() => this.loadGroupedProducts());
    });
  }

  viewProduct(id: any) {
    this.myproductService.getProductById(id).subscribe((data) => {
      this.dialog.open(ViewProductDialogComponent, {
        data: { productFromParent: data },
      });
    });
  }

  createProduct() {
    const dialog = this.dialog.open(CreateProductDialogComponent, {
      width: '500px',
    });
    dialog.afterClosed().subscribe(() => this.loadGroupedProducts());
  }

  logout(): void {
    this.http
      .post('/api/users/user/logout', {}, { withCredentials: true })
      .subscribe({
        complete: () => this.router.navigate(['/login']),
      });
  }
}
