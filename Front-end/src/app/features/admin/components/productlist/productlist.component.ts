import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CoreProductService } from '@app/core/services/core-product.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ViewProductDialogComponent } from './view-product-dialog/view-product-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog/edit-product-dialog.component';
import { CreateProductDialogComponent } from './create-product-dialog/create-product-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productlist',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule],
  templateUrl: './productlist.component.html',
  styleUrl: './productlist.component.css',
})
export class ProductlistComponent implements OnInit {
  products: any;
  image =
    'https://w7.pngwing.com/pngs/249/759/png-transparent-chair-comfort-furniture-commode-comfortable-chairs-angle-furniture-fashion-thumbnail.png';
  constructor(
    private myproductService: CoreProductService,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient
  ) { }
  ngOnInit() {
    this.myproductService.getAllProducts().subscribe((data) => {
      this.products = data;
      console.log(this.products);
    });
  }

  deleteProduct(id: any) {
    this.myproductService.deleteProduct(id).subscribe((data) => {
      console.log(data);
      this.products = this.products.filter((product: any) => product.id !== id);
      Swal.fire({
        icon: 'success',
        title: 'Your Product Deleted successfully',
      }).then(() => {
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate(['/admin/product']);
          });
      });
    });
  }

  editProduct(id: any) {
    this.myproductService.getProductById(id).subscribe((data) => {
      const product = data;
      console.log(product);

      const dialog = this.dialog.open(EditProductDialogComponent, {
        width: '500px',
        data: {
          productFromParent: product,
        },
      });
    });
  }

  viewProduct(id: any) {
    this.myproductService.getProductById(id).subscribe((data) => {
      const product = data;
      console.log(product);

      const dialog = this.dialog.open(ViewProductDialogComponent, {
        data: {
          productFromParent: product,
        },
      });
    });
  }

  createProduct() {
    const dialog = this.dialog.open(CreateProductDialogComponent, {
      width: '500px',
    });
  }
  logout(): void {
    this.http
      .post(
        '/api/users/user/logout',
        {},
        { withCredentials: true }
      )
      .subscribe({
        complete: () => this.router.navigate(['/login']),
      });
  }
}
