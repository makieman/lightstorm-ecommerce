import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { CoreProductService } from '@app/core/services/core-product.service';
import { CartProductsCountService } from '@app/core/services/cart-products-count.service';
import { CartService } from '@app/core/services/cart.service';
import { GlobalSearchComponent } from '../global-search/global-search.component';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule,
    CommonModule,
    FormsModule,
    GlobalSearchComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  matMenu: any;
  data: number = 0;
  oredersTotalPrice: number = 0;
  user_id: any;
  searchQuery: string = '';
  showCategories: boolean = false;

  categories = [
    {
      name: 'Solar & Renewable Energy',
      icon: 'wb_sunny',
      slug: 'solar',
      description: 'Panels, Inverters, Batteries & Installation'
    },
    {
      name: 'Borehole & Water Solutions',
      icon: 'water_drop',
      slug: 'water',
      description: 'Drilling, Pumps, Tanks & Systems'
    },
    {
      name: 'Electrical & Wiring',
      icon: 'bolt',
      slug: 'electrical',
      description: 'Installations & Electric Fencing'
    }
  ];

  constructor(
    private productService: CoreProductService, 
    private productsCount: CartProductsCountService,
    private cartService: CartService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  private getCartCount(carts: any[] = []): number {
    return carts.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  ngOnInit() {
    this.productService.getUserToken().subscribe({
      next: (data: any) => {
        this.zone.run(() => {
          this.data = this.getCartCount(data.data.carts);
          this.user_id = data.data._id;
          this.productsCount.updateData(this.data);
          this.cdr.markForCheck();
        });

        data.data.orders.forEach((element: { totalPrice: number; }) => {
          this.productService.getOrderById(element).subscribe({
            next: (orderData: any) => {
              if (orderData && orderData.totalPrice) {
                this.zone.run(() => {
                  this.oredersTotalPrice += orderData.totalPrice;
                  this.cdr.markForCheck();
                });
              }
            }
          });
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.cartService.updateCartCount();
          this.cdr.markForCheck();
        });
      }
    });

    this.productsCount.data$.subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.data = data;
          this.cdr.markForCheck();
        });
      }
    });
  }

}
