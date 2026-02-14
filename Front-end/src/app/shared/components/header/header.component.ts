import { Component, OnInit } from '@angular/core';
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
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.productService.getUserToken().subscribe({
      next: (data: any) => {
        this.data = data.data.carts.length;
        this.user_id = data.data._id;
        // Optionally update the count service with the real backend count
        this.productsCount.updateData(this.data);
        
        data.data.orders.forEach((element: { totalPrice: number; }) => {
          this.productService.getOrderById(element).subscribe({
            next: (data: any) => {
              if (data && data.totalPrice) {
                this.oredersTotalPrice += data.totalPrice;
              }
            }
          });
        });
      },
      error: (err) => {
        // Guest user: Load guest count
        this.cartService.updateCartCount();
      }
    });

    this.productsCount.data$.subscribe({
      next: (data) => {
        this.data = data;
      }
    });
  }

}
